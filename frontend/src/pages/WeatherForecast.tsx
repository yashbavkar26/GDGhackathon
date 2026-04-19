import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Droplets, Wind, Thermometer, Sun, AlertTriangle, Eye } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const weekForecast = [
  { day: "Mon", temp: 32, humidity: 65, rain: 0, risk: 25 },
  { day: "Tue", temp: 34, humidity: 70, rain: 10, risk: 35 },
  { day: "Wed", temp: 30, humidity: 80, rain: 45, risk: 62 },
  { day: "Thu", temp: 28, humidity: 88, rain: 60, risk: 78 },
  { day: "Fri", temp: 27, humidity: 92, rain: 40, risk: 85 },
  { day: "Sat", temp: 29, humidity: 75, rain: 15, risk: 55 },
  { day: "Sun", temp: 31, humidity: 68, rain: 5, risk: 30 },
];

const riskFactors = [
  { factor: "Humidity > 85%", impact: "High", desc: "Fungal spore germination accelerates above 85% RH", icon: Droplets },
  { factor: "Temp 25-30°C", impact: "High", desc: "Optimal range for most crop pathogens", icon: Thermometer },
  { factor: "Continuous rain", impact: "Critical", desc: "48h+ rain creates ideal pest breeding conditions", icon: Cloud },
  { factor: "Wind speed > 20km/h", impact: "Medium", desc: "Spore dispersal increases with wind velocity", icon: Wind },
];

const impactColor: Record<string, string> = {
  Medium: "bg-warning/15 text-warning",
  High: "bg-destructive/15 text-destructive",
  Critical: "bg-destructive text-destructive-foreground",
};

export default function WeatherForecast() {
  const todayData = weekForecast[0];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-display font-bold">Weather-Linked Forecasting</h1>
          <p className="text-sm text-muted-foreground mt-1">Predict pest & disease conditions based on weather patterns</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Temperature", value: `${todayData.temp}°C`, icon: Thermometer, sub: "Feels like 35°C" },
            { label: "Humidity", value: `${todayData.humidity}%`, icon: Droplets, sub: "Moderate" },
            { label: "Rainfall", value: `${todayData.rain}mm`, icon: Cloud, sub: "No rain today" },
            { label: "Wind", value: "12 km/h", icon: Wind, sub: "NW direction" },
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
                  <Area type="monotone" dataKey="risk" stroke="hsl(36,90%,55%)" fill="hsl(36,90%,55%)" fillOpacity={0.15} strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-xs font-semibold text-warning flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Peak risk on Friday (85%)
                </p>
                <p className="text-xs text-muted-foreground mt-1">High humidity + rain creates optimal conditions for Leaf Blight outbreak</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Droplets className="h-4 w-4 text-info" /> Humidity & Rainfall
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weekForecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(90,15%,88%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="humidity" fill="hsl(200,80%,50%)" radius={[4, 4, 0, 0]} opacity={0.7} />
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
                <div key={rf.factor} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                    <rf.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">{rf.factor}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${impactColor[rf.impact]}`}>{rf.impact}</span>
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
