import { Briefcase } from "lucide-react";
import { Button } from "./ui/button";

interface JobCardProps {
  title: string;
  onClick: () => void;
  delay?: number;
}

const JobCard = ({ title, onClick, delay = 0 }: JobCardProps) => {
  return (
    <div
      className="cyber-card p-4 sm:p-6 cursor-pointer group animate-fade-in cyber-border"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="p-2 sm:p-3 rounded-lg bg-primary/10 border border-primary/20 group-hover:animate-glow-pulse">
          <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-gradient transition-all duration-300 leading-tight">
            {title}
          </h3>
        </div>
        <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm sm:text-base">
          →
        </div>
      </div>
    </div>
  );
};

export default JobCard;
