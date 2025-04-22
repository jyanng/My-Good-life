import { useState } from "react";
import { LearningModule } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatDate } from "@/lib/constants";

interface VideoModuleProps {
  module: LearningModule;
}

export default function VideoModule({ module }: VideoModuleProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Format duration
  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Unknown duration';
    return `${minutes} min`;
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>{module.title}</CardTitle>
            <CardDescription>{module.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="bg-gray-100 rounded-md aspect-video flex items-center justify-center mb-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play text-white">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <img 
            src={`https://img.youtube.com/vi/${module.videoUrl.split('/').pop()}/0.jpg`} 
            alt={module.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // If thumbnail can't be loaded, show a fallback
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Cline x1='9' x2='15' y1='10' y2='10'/%3E%3Cline x1='12' x2='12' y1='7' y2='13'/%3E%3C/svg%3E";
            }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
            {formatCategoryName(module.category)}
          </Badge>
          <span className="text-sm text-gray-500">{formatDuration(module.duration)}</span>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button 
          className="w-full" 
          onClick={() => setIsDialogOpen(true)}
        >
          Watch Module
        </Button>
      </CardFooter>
      
      {/* Video Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{module.title}</DialogTitle>
            <DialogDescription>{module.description}</DialogDescription>
          </DialogHeader>
          
          <div className="aspect-video w-full mt-4">
            <iframe 
              src={module.videoUrl} 
              title={module.title}
              className="w-full h-full border-0 rounded-md"
              allowFullScreen
            ></iframe>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {formatCategoryName(module.category)}
              </Badge>
              <span className="text-sm text-gray-500 ml-2">{formatDuration(module.duration)}</span>
            </div>
            <span className="text-sm text-gray-500">Added: {formatDate(module.createdAt)}</span>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
