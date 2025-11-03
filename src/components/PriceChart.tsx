import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryClipContainer } from 'victory-native';

type Props = {
	data: { x: number; y: number }[];
	isLandscape: boolean;
	color?: string;
};

export default function PriceChart({ data, isLandscape, color = '#8AB4F8' }: Props) {
	return (
		<View style={[styles.container, isLandscape && styles.containerLandscape]}>
			<VictoryChart
				padding={{ top: 12, bottom: 24, left: 40, right: 12 }}
				domainPadding={{ y: 12 }}
				theme={VictoryTheme.material}
				height={isLandscape ? 260 : 280}
			>
				<VictoryAxis
					style={{
						axis: { stroke: '#2A2F3E' },
						tickLabels: { fill: '#7E8596', fontSize: 10 },
						grid: { stroke: '#1B1F2A' },
					}}
					tickFormat={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
				/>
				<VictoryAxis
					dependentAxis
					style={{
						axis: { stroke: '#2A2F3E' },
						tickLabels: { fill: '#7E8596', fontSize: 10 },
						grid: { stroke: '#1B1F2A' },
					}}
				/>
				<VictoryLine
					data={data}
					interpolation="monotoneX"
					style={{ data: { stroke: color, strokeWidth: 2 } }}
					groupComponent={<VictoryClipContainer clipPadding={{ top: 5, right: 10 }}/>} 
				/>
			</VictoryChart>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#0B0B0F',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#1B1F2A',
		paddingTop: 6,
	},
	containerLandscape: {
		paddingHorizontal: 6,
	},
});


