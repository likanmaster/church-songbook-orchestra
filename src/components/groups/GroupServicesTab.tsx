
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, BookOpen } from "lucide-react";

interface Service {
  id: string;
  title: string;
  date: string;
}

interface GroupServicesTabProps {
  services: Service[];
}

const GroupServicesTab = ({ services }: GroupServicesTabProps) => {
  if (services.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No hay servicios compartidos</h3>
        <p className="text-muted-foreground">
          Este grupo aún no tiene servicios compartidos
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => (
        <Link to={`/services/${service.id}`} key={service.id}>
          <Card className="h-full hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {service.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <Clock className="h-4 w-4" />
                {service.date}
              </div>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default GroupServicesTab;
