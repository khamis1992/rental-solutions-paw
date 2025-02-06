import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  Banknote, 
  BarChart3, 
  Users, 
  FileText, 
  Car, 
  Scale, 
  HelpCircle,
  AlertTriangle
} from "lucide-react";

interface FeatureGuideProps {
  icon: React.ElementType;
  title: string;
  description: string;
  keyFeatures: string[];
}

const FeatureGuide = ({ icon: Icon, title, description, keyFeatures }: FeatureGuideProps) => {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="text-lg font-medium text-right">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground text-right">{description}</p>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-right">الميزات الرئيسية:</h4>
          <ul className="text-sm space-y-1">
            {keyFeatures.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 justify-end">
                <span className="text-right">{feature}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};

export const FeatureGuides = () => {
  const guides: FeatureGuideProps[] = [
    {
      icon: LayoutDashboard,
      title: "لوحة التحكم",
      description: "احصل على نظرة شاملة لعمليات التأجير الخاصة بك مع المقاييس والرؤى في الوقت الفعلي.",
      keyFeatures: [
        "مقاييس الأعمال في الوقت الفعلي",
        "مراقبة النشاط",
        "وصول سريع للمهام الشائعة",
        "واجهات قابلة للتخصيص"
      ]
    },
    {
      icon: Banknote,
      title: "إدارة المالية",
      description: "إدارة جميع الجوانب المالية لأعمال التأجير الخاصة بك بكفاءة.",
      keyFeatures: [
        "معالجة المدفوعات",
        "إنشاء الفواتير",
        "التقارير المالية",
        "تتبع الإيرادات"
      ]
    },
    {
      icon: BarChart3,
      title: "التقارير والتحليلات",
      description: "إنشاء تقارير مفصلة والحصول على رؤى قيمة حول أداء عملك.",
      keyFeatures: [
        "إنشاء تقارير مخصصة",
        "تحليلات الأداء",
        "تصور البيانات",
        "إمكانيات التصدير"
      ]
    },
    {
      icon: Users,
      title: "إدارة العملاء",
      description: "إدارة علاقات العملاء بكفاءة والحفاظ على ملفات تعريف مفصلة.",
      keyFeatures: [
        "ملفات العملاء",
        "إدارة الوثائق",
        "سجل الاتصالات",
        "تقييم الائتمان"
      ]
    },
    {
      icon: FileText,
      title: "الاتفاقيات",
      description: "إنشاء وإدارة اتفاقيات الإيجار مع سير العمل الآلي.",
      keyFeatures: [
        "إنشاء الاتفاقيات",
        "إدارة القوالب",
        "التوقيعات الرقمية",
        "جدولة المدفوعات"
      ]
    },
    {
      icon: Car,
      title: "إدارة المركبات",
      description: "تتبع وإدارة أسطول مركباتك بفعالية.",
      keyFeatures: [
        "تتبع المركبات",
        "جدولة الصيانة",
        "إدارة التوافر",
        "تخزين الوثائق"
      ]
    },
    {
      icon: Scale,
      title: "الإدارة القانونية",
      description: "التعامل مع الجوانب القانونية لأعمال التأجير الخاصة بك بثقة.",
      keyFeatures: [
        "إدارة العقود",
        "إنشاء المستندات القانونية",
        "تتبع الامتثال",
        "إدارة القضايا"
      ]
    },
    {
      icon: AlertTriangle,
      title: "المخالفات المرورية",
      description: "إدارة ومعالجة المخالفات المرورية والغرامات بكفاءة.",
      keyFeatures: [
        "تتبع المخالفات",
        "التعيين التلقائي",
        "معالجة المدفوعات",
        "سجل المخالفات"
      ]
    },
    {
      icon: HelpCircle,
      title: "المساعدة والدعم",
      description: "الوصول إلى موارد المساعدة الشاملة ووثائق الدعم.",
      keyFeatures: [
        "أدلة خطوة بخطوة",
        "فيديوهات تعليمية",
        "الأسئلة الشائعة",
        "الاتصال بالدعم"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-right">دليل الميزات</h2>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid gap-6">
          {guides.map((guide, index) => (
            <FeatureGuide key={index} {...guide} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};