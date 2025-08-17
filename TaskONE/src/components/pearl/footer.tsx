import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, Twitter, Mail, Code2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold glow-text">Pearl</h3>
            <p className="text-muted-foreground max-w-xs">
              Your ultimate destination for coding interview preparation. 
              Practice with curated questions and master programming concepts.
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon">
                <Github className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Features</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Voice-controlled search
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Difficulty-based filtering
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Category organization
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Progress tracking
              </li>
            </ul>
          </div>

          <Card className="dining-card p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <Code2 className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-bold text-primary">Ready for More?</h3>
            </div>
            <p className="text-muted-foreground mb-4 text-sm">
              This platform showcases modern web technologies with elegant design patterns.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">
                Voice Control ✓
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">
                Dark Mode ✓
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">
                Responsive ✓
              </span>
            </div>
          </Card>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 GeekHeaven. Crafted with modern web technologies.
          </p>
        </div>
      </div>
    </footer>
  );
};