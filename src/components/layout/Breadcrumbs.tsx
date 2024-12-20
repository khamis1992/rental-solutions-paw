import { Home, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link
        to="/"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return (
          <div key={routeTo} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link
              to={routeTo}
              className={`capitalize hover:text-foreground transition-colors ${
                isLast ? "text-foreground font-medium" : ""
              }`}
              aria-current={isLast ? "page" : undefined}
            >
              {name}
            </Link>
          </div>
        );
      })}
    </nav>
  );
};