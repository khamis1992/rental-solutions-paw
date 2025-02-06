import { Card } from "@/components/ui/card";
import { BookOpen, Users, Car, FileText, BarChart3, Banknote, AlertTriangle } from "lucide-react";

export const SystemOverview = () => {
  const features = [
    {
      icon: Users,
      title: "إدارة العملاء",
      description: "إدارة ملفات العملاء والوثائق وسجل التأجير بكفاءة"
    },
    {
      icon: Car,
      title: "إدارة المركبات",
      description: "تتبع حالة المركبات والصيانة والتوافر في الوقت الفعلي"
    },
    {
      icon: FileText,
      title: "الاتفاقيات",
      description: "إنشاء وإدارة اتفاقيات التأجير مع سير العمل الآلي"
    },
    {
      icon: Banknote,
      title: "المالية",
      description: "إدارة المعاملات وتتبع النفقات وإدارة التقارير المالية"
    },
    {
      icon: AlertTriangle,
      title: "المخالفات المرورية",
      description: "معالجة وإدارة المخالفات المرورية مع إمكانيات التعيين التلقائي"
    },
    {
      icon: BarChart3,
      title: "التقارير والتحليلات",
      description: "إنشاء رؤى شاملة مع أدوات تقارير متقدمة"
    }
  ];

  return (
    <div className="w-full space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-right">مرحباً بك في نظام إدارة التأجير</h2>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl text-right">
          نظام إدارة التأجير هو نظام شامل مصمم لتبسيط عمليات التأجير الخاصة بك.
          سيرشدك مركز المساعدة هذا خلال جميع الميزات والوظائف في النظام.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className="p-6 hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <feature.icon className="h-5 w-5 text-primary flex-shrink-0" />
                <h3 className="text-lg font-medium text-right">{feature.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed text-right">
                {feature.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};