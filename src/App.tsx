import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import PriceChart from './components/PriceChart';
import { fetchYahooChart } from './api/yahoo';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

type Ticker = {
	symbol: string;
	label: string;
	color: string;
};

type SeriesPoint = { x: number; y: number };

const TICKERS: Ticker[] = [
	{ symbol: 'BTC-USD', label: 'Bitcoin', color: '#F7931A' },
	{ symbol: 'ETH-USD', label: 'Ethereum', color: '#A0A3A8' },
	{ symbol: '^GSPC', label: 'S&P 500', color: '#FF3B30' },
	{ symbol: '^NDX', label: 'NASDAQ-100', color: '#66B2FF' },
	{ symbol: 'NVDA', label: 'NVIDIA', color: '#76B900' },
	{ symbol: 'SOFI', label: 'SoFi', color: '#2EC4F1' },
];

const DEFAULT_ROTATE_SECONDS = 3;
const REFRESH_SECONDS = 10;

export default function App() {
    const [fontsLoaded] = useFonts({ PressStart2P_400Regular });
	const [activeIndex, setActiveIndex] = useState<number>(0);
	const [rotateSeconds, setRotateSeconds] = useState<number>(DEFAULT_ROTATE_SECONDS);
	const [showSettings, setShowSettings] = useState<boolean>(false);
	const [series, setSeries] = useState<Record<string, SeriesPoint[]>>({});
	const [lastPrice, setLastPrice] = useState<Record<string, number>>({});
	const [changePct, setChangePct] = useState<Record<string, number>>({});
	const [loading, setLoading] = useState<boolean>(true);
	const mountedRef = useRef<boolean>(true);

	const [selectedSymbols, setSelectedSymbols] = useState<string[]>(TICKERS.map(t => t.symbol));

	const activeTickers = useMemo(() => (selectedSymbols.length ? TICKERS.filter(t => selectedSymbols.includes(t.symbol)) : TICKERS), [selectedSymbols]);

	const activeTicker = useMemo(() => activeTickers[activeIndex % activeTickers.length], [activeIndex, activeTickers]);

	const loadData = useCallback(async (symbol: string) => {
		try {
			const data = await fetchYahooChart({ symbol, range: '1d', interval: '1m', includePrePost: true });
			if (!mountedRef.current) return;
			setSeries(prev => ({ ...prev, [symbol]: data.points }));
			setLastPrice(prev => ({ ...prev, [symbol]: data.last }));
			setChangePct(prev => ({ ...prev, [symbol]: data.changePct }));
		} catch (e) {
			// Swallow errors, keep UI responsive
		} finally {
			if (mountedRef.current) setLoading(false);
		}
	}, []);

	// Initial load for all tickers
	useEffect(() => {
		TICKERS.forEach(t => loadData(t.symbol));
	}, [loadData]);

// Rotate ticker view over selected tickers
useEffect(() => {
    const id = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % (activeTickers.length || 1));
    }, rotateSeconds * 1000);
    return () => clearInterval(id);
}, [rotateSeconds, activeTickers.length]);

// Keep index in range when selection changes
useEffect(() => {
    if (activeIndex >= activeTickers.length) setActiveIndex(0);
}, [activeTickers.length]);

	// Refresh ALL selected tickers every 10 seconds
	useEffect(() => {
		const id = setInterval(() => {
			const symbolsToRefresh = (selectedSymbols.length ? selectedSymbols : TICKERS.map(t => t.symbol));
			symbolsToRefresh.forEach(sym => loadData(sym));
		}, REFRESH_SECONDS * 1000);
		return () => clearInterval(id);
	}, [selectedSymbols, loadData]);

	useEffect(() => {
		return () => {
			mountedRef.current = false;
		};
	}, []);

	const { width, height } = Dimensions.get('window');
	const isLandscape = width > height;

	// Transition state for push effect
	const transition = useRef(new Animated.Value(1)).current; // 1 means settled
	const prevTickerRef = useRef<Ticker | null>(null);

	// When activeTicker changes, animate push from right to left
	useEffect(() => {
		if (!prevTickerRef.current) {
			prevTickerRef.current = activeTicker;
			transition.setValue(1);
			return;
		}
		const prev = prevTickerRef.current;
		if (prev.symbol === activeTicker.symbol) return;
		transition.setValue(0);
		Animated.timing(transition, {
			toValue: 1,
			duration: 900,
			easing: Easing.inOut(Easing.cubic),
			useNativeDriver: true,
		}).start(() => {
			prevTickerRef.current = activeTicker;
		});
	}, [activeTicker]);

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar style="light" />
			{/* Sliding content container */}
			<View style={{ flex: 1, overflow: 'hidden' }}>
				{(() => {
					const prev = prevTickerRef.current || activeTicker;
					const prevTranslate = transition.interpolate({ inputRange: [0, 1], outputRange: [0, -width] });
					const currTranslate = transition.interpolate({ inputRange: [0, 1], outputRange: [width, 0] });

					const renderTickerView = (t: Ticker) => (
						<View>
							<View style={[styles.header, isLandscape && styles.headerLandscape]}>
								<Text style={[styles.title, { color: t.color }, fontsLoaded ? { fontFamily: 'PressStart2P_400Regular' } : null]}>{t.label}</Text>
								<Text style={styles.subtitle}>{t.symbol}</Text>
								<TouchableOpacity onPress={() => setShowSettings(true)}>
									<Text style={styles.settings}>⏱ {rotateSeconds}s</Text>
								</TouchableOpacity>
							</View>
							<View style={[styles.content, isLandscape && styles.contentLandscape]}>
								<View style={styles.priceRow}>
									<Text style={styles.price}>
										{lastPrice[t.symbol] ? lastPrice[t.symbol].toLocaleString(undefined, { maximumFractionDigits: 2 }) : loading ? '—' : 'N/A'}
									</Text>
									<Text style={[styles.changePct, (changePct[t.symbol] ?? 0) >= 0 ? styles.positive : styles.negative]}>
										{changePct[t.symbol] !== undefined ? `${changePct[t.symbol].toFixed(2)}%` : loading ? '' : ''}
									</Text>
								</View>
								<PriceChart data={series[t.symbol] ?? []} isLandscape={isLandscape} color={t.color} />
							</View>
						</View>
					);

					// When animating, render prev and current; otherwise, just current
					if (prev.symbol !== activeTicker.symbol && transition.__getValue() < 1) {
						return (
							<View style={{ flex: 1 }}>
								<Animated.View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, transform: [{ translateX: prevTranslate }] }}>
									{renderTickerView(prev)}
								</Animated.View>
								<Animated.View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, transform: [{ translateX: currTranslate }] }}>
									{renderTickerView(activeTicker)}
								</Animated.View>
							</View>
						);
					}
					return renderTickerView(activeTicker);
				})()}
			</View>

			<Modal visible={showSettings} transparent animationType="fade" onRequestClose={() => setShowSettings(false)}>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalCard}>
						<Text style={styles.modalTitle}>Rotation Interval</Text>
					<View style={styles.optionsRow}>
							{[2,3,5,7,10,15].map(sec => (
								<TouchableOpacity key={sec} style={[styles.optionBtn, rotateSeconds === sec && styles.optionBtnActive]} onPress={() => setRotateSeconds(sec)}>
									<Text style={styles.optionText}>{sec}s</Text>
								</TouchableOpacity>
							))}
						</View>
					<Text style={[styles.modalTitle, { marginTop: 12 }]}>Tickers</Text>
					<View style={styles.tickerRow}>
						{TICKERS.map(t => {
							const active = selectedSymbols.includes(t.symbol);
							return (
								<TouchableOpacity key={t.symbol} style={[styles.tickerBtn, active && styles.tickerBtnActive]} onPress={() => setSelectedSymbols(prev => active ? prev.filter(s => s !== t.symbol) : [...prev, t.symbol])}>
									<Text style={[styles.tickerText, { color: t.color }]}>{t.label}</Text>
								</TouchableOpacity>
							);
						})}
					</View>
					<View style={styles.optionsRow}>
						<TouchableOpacity style={styles.optionBtn} onPress={() => setSelectedSymbols(TICKERS.map(t => t.symbol))}>
							<Text style={styles.optionText}>Select All</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.optionBtn} onPress={() => setSelectedSymbols([])}>
							<Text style={styles.optionText}>Clear</Text>
						</TouchableOpacity>
					</View>
						<TouchableOpacity style={styles.closeBtn} onPress={() => setShowSettings(false)}>
							<Text style={styles.closeText}>Close</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
    	backgroundColor: '#000000',
	},
	header: {
		paddingHorizontal: 20,
		paddingTop: 8,
		paddingBottom: 6,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	headerLandscape: {
		paddingHorizontal: 30,
	},
	title: {
		color: '#FFFFFF',
    	fontSize: 30,
    	fontWeight: '800',
	},
	subtitle: {
		color: '#A0A3A8',
    	fontSize: 16,
		marginLeft: 8,
	},
	settings: {
		color: '#8AB4F8',
		fontSize: 14,
	},
	content: {
		flex: 1,
    	paddingHorizontal: 16,
		paddingBottom: 16,
	},
	contentLandscape: {
    	paddingHorizontal: 22,
	},
	priceRow: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		justifyContent: 'flex-start',
		gap: 12,
		marginBottom: 6,
	},
	price: {
		color: '#FFFFFF',
    	fontSize: 64,
    	fontWeight: '900',
		letterSpacing: 0.3,
	},
	changePct: {
    	fontSize: 24,
    	fontWeight: '800',
	},
	positive: { color: '#00E676' },
	negative: { color: '#FF5252' },
	modalBackdrop: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.6)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalCard: {
    	width: '90%',
		backgroundColor: '#151821',
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
		borderColor: '#242938',
	},
	modalTitle: {
		color: '#FFFFFF',
		fontSize: 18,
		fontWeight: '700',
		marginBottom: 12,
	},
	optionsRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	optionBtn: {
		borderWidth: 1,
		borderColor: '#2A2F3E',
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 8,
		backgroundColor: '#0F121A',
	},
	optionBtnActive: {
		borderColor: '#8AB4F8',
		backgroundColor: '#1A2235',
	},
	optionText: {
		color: '#E3E7EE',
		fontSize: 14,
		fontWeight: '600',
	},
	tickerRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginBottom: 8,
	},
	tickerBtn: {
		borderWidth: 1,
		borderColor: '#2A2F3E',
		paddingVertical: 8,
		paddingHorizontal: 10,
		borderRadius: 8,
		backgroundColor: '#0F121A',
	},
	tickerBtnActive: {
		borderColor: '#8AB4F8',
		backgroundColor: '#1A2235',
	},
	tickerText: {
		fontSize: 12,
		fontWeight: '800',
	},
	closeBtn: {
		marginTop: 14,
		alignSelf: 'flex-end',
		paddingVertical: 8,
		paddingHorizontal: 12,
		backgroundColor: '#22314E',
		borderRadius: 8,
	},
	closeText: {
		color: '#CDE0FF',
		fontWeight: '700',
	},
});


