import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { StatCard } from "@/components/StatCard";
import { Bug, Leaf, AlertTriangle, Users, TrendingUp, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";

const diseaseData = [
  { name: "Leaf Blight", cases: 245 },
  { name: "Rust", cases: 189 },
  { name: "Powdery Mildew", cases: 156 },
  { name: "Wilt", cases: 98 },
  { name: "Root Rot", cases: 67 },
  { name: "Mosaic Virus", cases: 45 },
];

const pieData = [
  { name: "Rice", value: 35 },
  { name: "Wheat", value: 25 },
  { name: "Cotton", value: 20 },
  { name: "Sugarcane", value: 12 },
  { name: "Maize", value: 8 },
];

const COLORS = ["hsl(145,63%,32%)", "hsl(36,90%,55%)", "hsl(200,80%,50%)", "hsl(0,72%,51%)", "hsl(270,60%,50%)"];

const trendData = [
  { month: "Jan", reports: 120, resolved: 98 },
  { month: "Feb", reports: 145, resolved: 130 },
  { month: "Mar", reports: 200, resolved: 175 },
  { month: "Apr", reports: 310, resolved: 240 },
  { month: "May", reports: 280, resolved: 260 },
  { month: "Jun", reports: 195, resolved: 185 },
];

const riskData = [
  { day: "Mon", risk: 35 },
  { day: "Tue", risk: 42 },
  { day: "Wed", risk: 58 },
  { day: "Thu", risk: 72 },
  { day: "Fri", risk: 85 },
  { day: "Sat", risk: 68 },
  { day: "Sun", risk: 45 },
];

const recentReports = [
  { id: 1, farmer: "Ramesh Kumar", crop: "Rice", disease: "Leaf Blight", location: "Punjab", severity: "High", time: "2h ago" },
  { id: 2, farmer: "Suresh Patel", crop: "Cotton", disease: "Bollworm", location: "Gujarat", severity: "Medium", time: "4h ago" },
  { id: 3, farmer: "Anita Sharma", crop: "Wheat", disease: "Rust", location: "Haryana", severity: "Low", time: "6h ago" },
  { id: 4, farmer: "Deepak Singh", crop: "Sugarcane", disease: "Red Rot", location: "UP", severity: "Critical", time: "8h ago" },
];

const severityColor: Record<string, string> = {
  Low: "bg-success/15 text-success",
  Medium: "bg-warning/15 text-warning",
  High: "bg-destructive/15 text-destructive",
  Critical: "bg-destructive text-destructive-foreground",
};

export default function Dashboard() {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time crop health monitoring across all regions</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active Outbreaks" value="23" change="↑ 12% this week" changeType="negative" icon={Bug} variant="danger" />
          <StatCard title="Crops Monitored" value="1,847" change="↑ 8% this month" changeType="positive" icon={Leaf} variant="primary" />
          <StatCard title="Risk Alerts" value="156" change="↓ 5% vs last week" changeType="positive" icon={AlertTriangle} variant="warning" />
          <StatCard title="Farmers Connected" value="12,453" change="↑ 320 new" changeType="positive" icon={Users} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Disease Reports Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(90,15%,88%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="reports" stroke="hsl(0,72%,51%)" fill="hsl(0,72%,51%)" fillOpacity={0.1} strokeWidth={2} />
                  <Area type="monotone" dataKey="resolved" stroke="hsl(145,63%,32%)" fill="hsl(145,63%,32%)" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display">Affected Crops</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {pieData.map((d, i) => (
                  <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                    {d.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display">Top Diseases</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={diseaseData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(90,15%,88%)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="cases" fill="hsl(145,63%,32%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display">7-Day Risk Index</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={riskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(90,15%,88%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="risk" stroke="hsl(36,90%,55%)" strokeWidth={2.5} dot={{ fill: "hsl(36,90%,55%)", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Recent Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentReports.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-2.5 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.farmer}</p>
                    <p className="text-xs text-muted-foreground">{r.crop} · {r.disease} · {r.location}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${severityColor[r.severity]}`}>
                      {r.severity}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{r.time}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
