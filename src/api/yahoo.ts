export type YahooChartResponse = {
	points: { x: number; y: number }[];
	last: number;
	changePct: number; // vs previous close
};

type FetchArgs = {
	symbol: string;
	range: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y';
	interval: '1m' | '2m' | '5m' | '15m' | '1h' | '1d';
	includePrePost?: boolean;
};

export async function fetchYahooChart({ symbol, range, interval, includePrePost = true }: FetchArgs): Promise<YahooChartResponse> {
	const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=${includePrePost ? 'true' : 'false'}`;
	const res = await fetch(url);
	if (!res.ok) throw new Error('Network error');
	const json = await res.json();
	const result = json?.chart?.result?.[0];
	if (!result) throw new Error('No data');
	const timestamps: number[] = result.timestamp || [];
	const close: number[] = result.indicators?.quote?.[0]?.close || [];
	const prevClose: number | undefined = result.meta?.previousClose;
	const points = timestamps.map((t: number, i: number) => ({ x: t * 1000, y: typeof close[i] === 'number' ? close[i] : NaN }))
		.filter(p => !Number.isNaN(p.y));
	const last = points.length ? points[points.length - 1].y : NaN;
	const changePct = prevClose && last ? ((last - prevClose) / prevClose) * 100 : 0;
	return { points, last, changePct };
}





