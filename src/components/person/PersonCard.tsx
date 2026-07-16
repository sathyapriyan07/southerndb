import { Link } from "react-router-dom";
import { cn, getInitials } from "@/lib/utils";
import { profileUrl } from "@/lib/supabase";
import { ImageWithLoader } from "@/components/shared/ImageWithLoader";
import { motion } from "framer-motion";

interface PersonCardProps {
  id: string;
  name: string;
  profilePath: string | null;
  knownFor?: string;
  className?: string;
}

export function PersonCard({ id, name, profilePath, knownFor, className }: PersonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("group", className)}
    >
      <Link to={`/person/${id}`} className="block text-center">
        <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto rounded-full overflow-hidden border-2 border-border group-hover:border-primary/50 transition-colors duration-300">
          <ImageWithLoader
            src={profileUrl(profilePath, "medium")}
            alt={name}
            className="w-full h-full object-cover"
            fallback="/placeholder-profile.svg"
          />
        </div>
        <h3 className="mt-3 text-sm font-medium text-text line-clamp-1 group-hover:text-primary transition-colors">
          {name}
        </h3>
        {knownFor && (
          <p className="text-xs text-text-muted mt-0.5">{knownFor}</p>
        )}
      </Link>
    </motion.div>
  );
}
