import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Download, Calendar, TrendingUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState, useEffect } from "react";

const monthlyData = [
  { month: "Jan", rice: 45, wheat: 30, cotton: 20 },
  { month: "Feb", rice: 55, wheat: 35, cotton: 25 },
  { month: "Mar", rice: 80, wheat: 60, cotton: 40 },
  { month: "Apr", rice: 120, wheat: 45, cotton: 35 },
  { month: "May", rice: 95, wheat: 25, cotton: 55 },
  { month: "Jun", rice: 70, wheat: 20, cotton: 45 },
];

const severityPie = [
  { name: "Low", value: 40, color: "hsl(145,63%,32%)" },
  { name: "Medium", value: 35, color: "hsl(36,90%,55%)" },
  { name: "High", value: 18, color: "hsl(0,72%,51%)" },
  { name: "Critical", value: 7, color: "hsl(0,72%,35%)" },
];

const staticReports = [
  { id: "RPT-2026-0412", region: "Punjab", date: "Apr 3, 2026", type: "Outbreak Summary", status: "Complete" },
  { id: "RPT-2026-0411", region: "Gujarat", date: "Apr 2, 2026", type: "Treatment Efficacy", status: "Complete" },
];

export default function Reports() {
  const [liveReports, setLiveReports] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cropguard_scans");
      if (saved) {
        const scans = JSON.parse(saved);
        setLiveReports(scans.map((s: any) => ({
          id: `SCAN-${s.id.toString().slice(-4)}`,
          region: s.location !== "Unknown Location Data" ? "Local Scan" : "Unknown",
          date: s.timestamp.split(', ')[1] || s.timestamp,
          type: `${s.crop} Analysis`,
          status: "Live Data",
          isLive: true
        })));
      }
    } catch (e) { }
  }, []);

  const allReports = [...liveReports, ...staticReports];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-2xl font-display font-bold">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">Comprehensive disease and pest management reports with live updates</p>
          </motion.div>
          <Button className="gradient-hero text-primary-foreground border-0 gap-2">
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Monthly Cases by Crop
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(90,15%,88%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="rice" fill="hsl(145,63%,32%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="wheat" fill="hsl(36,90%,55%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cotton" fill="hsl(200,80%,50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display">Severity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={severityPie} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                    {severityPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {severityPie.map((d) => (
                  <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ background: d.color }} /> {d.name} ({d.value}%)
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Recent Logged Scans & Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Region</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {allReports.map((r, index) => (
                    <tr key={index} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${(r as any).isLive ? 'bg-primary/5' : ''}`}>
                      <td className="py-3 px-2 font-mono text-xs">{r.id}</td>
                      <td className="py-3 px-2">{r.region}</td>
                      <td className="py-3 px-2 text-muted-foreground">{r.date}</td>
                      <td className="py-3 px-2">{r.type}</td>
                      <td className="py-3 px-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.status === "Live Data" ? "bg-primary/20 text-primary" : "bg-success/15 text-success"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button variant="ghost" size="sm"><Download className="h-3.5 w-3.5" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
