import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  Droplets,
  Wind,
  Thermometer,
  AlertTriangle,
  Eye,
  RefreshCcw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useEffect, useState } from "react";

type ForecastRow = {
  day: string;
  temp: number;
  humidity: number;
  rain: number;
  risk: number;
};

type LiveWeather = {
  temp: number;
  feelsLike: number;
  humidity: number;
  rain: number;
  windKmh: number;
  condition: string;
  locationLabel: string;
  updatedAt: string;
};

const defaultWeekForecast: ForecastRow[] = [
  { day: "Mon", temp: 32, humidity: 65, rain: 0, risk: 25 },
  { day: "Tue", temp: 34, humidity: 70, rain: 10, risk: 35 },
  { day: "Wed", temp: 30, humidity: 80, rain: 45, risk: 62 },
  { day: "Thu", temp: 28, humidity: 88, rain: 60, risk: 78 },
  { day: "Fri", temp: 27, humidity: 92, rain: 40, risk: 85 },
  { day: "Sat", temp: 29, humidity: 75, rain: 15, risk: 55 },
  { day: "Sun", temp: 31, humidity: 68, rain: 5, risk: 30 },
];

const riskFactors = [
  {
    factor: "Humidity > 85%",
    impact: "High",
    desc: "Fungal spore germination accelerates above 85% RH",
    icon: Droplets,
  },
  {
    factor: "Temp 25-30C",
    impact: "High",
    desc: "Optimal range for most crop pathogens",
    icon: Thermometer,
  },
  {
    factor: "Continuous rain",
    impact: "Critical",
    desc: "48h+ rain creates ideal pest breeding conditions",
    icon: Cloud,
  },
  {
    factor: "Wind speed > 20km/h",
    impact: "Medium",
    desc: "Spore dispersal increases with wind velocity",
    icon: Wind,
  },
];

const impactColor: Record<string, string> = {
  Medium: "bg-warning/15 text-warning",
  High: "bg-destructive/15 text-destructive",
  Critical: "bg-destructive text-destructive-foreground",
};

const openWeatherApiKey =
  import.meta.env.VITE_OPENWEATHER_API_KEY ||
  "YOUR_OPENWEATHER_API_KEY";

const toNumber = (...values: unknown[]) => {
  for (const value of values) {
    const n = Number(value);
    if (!Number.isNaN(n) && Number.isFinite(n)) return n;
  }
  return 0;
};

const computeRisk = (temp: number, humidity: number, rain: number) => {
  const humidityRisk = Math.max(0, (humidity - 50) * 0.9);
  const rainRisk = Math.min(rain * 1.5, 35);
  const tempRisk = temp >= 25 && temp <= 32 ? 20 : temp > 32 ? 14 : 9;
  return Math.max(5, Math.min(95, Math.round(humidityRisk + rainRisk + tempRisk)));
};

const getCurrentPosition = () =>
  new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 120000,
    });
  });

const weekdayLabel = (dateUnixSec: number) =>
  new Date(dateUnixSec * 1000).toLocaleDateString("en-US", { weekday: "short" });

export default function WeatherForecastOpenWeather() {
  const [latestCrop, setLatestCrop] = useState<string | null>(null);
  const [weekForecast, setWeekForecast] = useState<ForecastRow[]>(defaultWeekForecast);
  const [liveWeather, setLiveWeather] = useState<LiveWeather | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cropguard_scans");
      if (saved) {
        const scans = JSON.parse(saved);
        if (scans && scans.length > 0) {
          setLatestCrop(scans[0].crop);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const loadWeather = async () => {
    setLoadingWeather(true);
    setWeatherError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported on this device/browser.");
      }

      const position = await getCurrentPosition();
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const [currentResp, forecastResp] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`,
        ),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`,
        ),
      ]);

      if (!currentResp.ok) {
        throw new Error("Could not fetch current weather from OpenWeather.");
      }
      if (!forecastResp.ok) {
        throw new Error("Could not fetch forecast weather from OpenWeather.");
      }

      const currentData = await currentResp.json();
      const forecastData = await forecastResp.json();

      const temp = toNumber(currentData?.main?.temp);
      const feelsLike = toNumber(currentData?.main?.feels_like, temp);
      const humidity = toNumber(currentData?.main?.humidity);
      const rain = toNumber(currentData?.rain?.["1h"], currentData?.rain?.["3h"], 0);
      const windKmh = toNumber(currentData?.wind?.speed, 0) * 3.6;
      const condition = currentData?.weather?.[0]?.description || "Live Conditions";
      const locationLabel =
        currentData?.name && currentData?.sys?.country
          ? `${currentData.name}, ${currentData.sys.country}`
          : `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

      const list = Array.isArray(forecastData?.list) ? forecastData.list : [];
      const grouped: Record<
        string,
        { dt: number; temps: number[]; humidities: number[]; rainTotal: number }
      > = {};

      list.forEach((entry: any) => {
        const dt = toNumber(entry?.dt);
        if (!dt) return;
        const key = new Date(dt * 1000).toISOString().slice(0, 10);
        if (!grouped[key]) {
          grouped[key] = { dt, temps: [], humidities: [], rainTotal: 0 };
        }
        grouped[key].temps.push(toNumber(entry?.main?.temp));
        grouped[key].humidities.push(toNumber(entry?.main?.humidity));
        grouped[key].rainTotal += toNumber(entry?.rain?.["3h"], 0);
      });

      const parsedWeek = Object.values(grouped)
        .sort((a, b) => a.dt - b.dt)
        .slice(0, 7)
        .map((d) => {
          const avgTemp = d.temps.reduce((a, b) => a + b, 0) / Math.max(d.temps.length, 1);
          const avgHumidity =
            d.humidities.reduce((a, b) => a + b, 0) / Math.max(d.humidities.length, 1);
          const dayRain = d.rainTotal;
          return {
            day: weekdayLabel(d.dt),
            temp: Number(avgTemp.toFixed(1)),
            humidity: Number(avgHumidity.toFixed(1)),
            rain: Number(dayRain.toFixed(1)),
            risk: computeRisk(avgTemp, avgHumidity, dayRain),
          };
        });

      setLiveWeather({
        temp,
        feelsLike,
        humidity,
        rain,
        windKmh,
        condition,
        locationLabel,
        updatedAt: new Date().toLocaleTimeString(),
      });
      setWeekForecast(parsedWeek.length > 0 ? parsedWeek : defaultWeekForecast);
    } catch (err: any) {
      setWeatherError(
        err?.message || "Unable to fetch live weather for your current location right now.",
      );
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, []);

  const todayData = weekForecast[0];
  const peakRiskDay = [...weekForecast].sort((a, b) => b.risk - a.risk)[0] || todayData;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-2xl font-display font-bold">Weather-Linked Forecasting</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Predict pest and disease conditions based on weather patterns{" "}
              {latestCrop && `for your recent ${latestCrop} scans`}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {liveWeather
                ? `Live location: ${liveWeather.locationLabel} · Updated ${liveWeather.updatedAt}`
                : "Fetching live weather from your current location..."}
            </p>
            {weatherError && <p className="text-xs text-destructive mt-2">{weatherError}</p>}
          </motion.div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={loadWeather}
            disabled={loadingWeather}
          >
            <RefreshCcw className={`h-4 w-4 ${loadingWeather ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Temperature",
              value: `${(liveWeather?.temp ?? todayData.temp).toFixed(1)}C`,
              icon: Thermometer,
              sub: `Feels like ${(liveWeather?.feelsLike ?? todayData.temp).toFixed(1)}C`,
            },
            {
              label: "Humidity",
              value: `${Math.round(liveWeather?.humidity ?? todayData.humidity)}%`,
              icon: Droplets,
              sub:
                (liveWeather?.humidity ?? todayData.humidity) > 80
                  ? "High humidity"
                  : "Moderate",
            },
            {
              label: "Rainfall",
              value: `${(liveWeather?.rain ?? todayData.rain).toFixed(1)}mm`,
              icon: Cloud,
              sub:
                (liveWeather?.rain ?? todayData.rain) > 0
                  ? `${(liveWeather?.rain ?? todayData.rain).toFixed(1)}mm expected`
                  : "No rain right now",
            },
            {
              label: "Wind",
              value: `${(liveWeather?.windKmh ?? 0).toFixed(1)} km/h`,
              icon: Wind,
              sub: liveWeather?.condition || "Live conditions",
            },
          ].map((w) => (
            <Card key={w.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <w.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{w.label}</p>
                  <p className="text-xl font-display font-bold">{w.value}</p>
                  <p className="text-[10px] text-muted-foreground">{w.sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" /> Pest Risk Forecast (7-Day)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={weekForecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(90,15%,88%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="risk"
                    stroke="hsl(36,90%,55%)"
                    fill="hsl(36,90%,55%)"
                    fillOpacity={0.15}
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-xs font-semibold text-warning flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Peak risk on {peakRiskDay.day} (
                  {peakRiskDay.risk}%)
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  High humidity plus rain creates optimal conditions for{" "}
                  {latestCrop ? `${latestCrop} disease` : "Leaf Blight"} outbreak
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Droplets className="h-4 w-4 text-info" /> Humidity and Rainfall
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weekForecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(90,15%,88%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar
                    dataKey="humidity"
                    fill="hsl(200,80%,50%)"
                    radius={[4, 4, 0, 0]}
                    opacity={0.7}
                  />
                  <Bar dataKey="rain" fill="hsl(145,63%,32%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" /> Risk Factors Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {riskFactors.map((rf) => (
                <div
                  key={rf.factor}
                  className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                    <rf.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">{rf.factor}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${impactColor[rf.impact]}`}
                      >
                        {rf.impact}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{rf.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
