import { useState } from "react";
import { CaseStudy } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DOMAINS } from "@/lib/constants";
import { formatDate } from "@/lib/constants";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
}

export default function CaseStudyCard({ caseStudy }: CaseStudyCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Get the first domain as the primary one for coloring (if any)
  const primaryDomainId = caseStudy.domains && caseStudy.domains.length > 0 
    ? caseStudy.domains[0] 
    : undefined;
  
  const primaryDomain = DOMAINS.find(d => d.id === primaryDomainId);
  
  // Get domain info for all domains
  const domainInfo = caseStudy.domains?.map(domainId => 
    DOMAINS.find(d => d.id === domainId)
  ).filter(Boolean) || [];

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{caseStudy.title}</CardTitle>
            <CardDescription>{caseStudy.description}</CardDescription>
          </div>
          {primaryDomain && (
            <div 
              className={`w-8 h-8 rounded-full ${primaryDomain.bgClass} flex items-center justify-center text-white flex-shrink-0`}
              title={primaryDomain.name}
            >
              {primaryDomain.name.charAt(0)}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-700 mb-4 line-clamp-3">{caseStudy.content}</p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {domainInfo.map(domain => domain && (
            <Badge 
              key={domain.id} 
              variant="outline"
              className={`${domain.lightBgClass} ${domain.textClass} border-none`}
            >
              {domain.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <span className="text-xs text-gray-500">Added: {formatDate(caseStudy.createdAt)}</span>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">View Case Study</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{caseStudy.title}</DialogTitle>
              <DialogDescription>{caseStudy.description}</DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {domainInfo.map(domain => domain && (
                  <Badge 
                    key={domain.id} 
                    variant="outline"
                    className={`${domain.lightBgClass} ${domain.textClass} border-none`}
                  >
                    {domain.name}
                  </Badge>
                ))}
              </div>
              
              {caseStudy.goodLifeVision && (
                <div className="my-4 p-4 border-l-4 bg-purple-50 border-purple-400 rounded">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Good Life Vision</h3>
                  <p className="italic text-purple-700">"{caseStudy.goodLifeVision}"</p>
                </div>
              )}

              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{caseStudy.content}</p>
              </div>
              
              {caseStudy.mediaUrls && caseStudy.mediaUrls.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Related Media</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {caseStudy.mediaUrls.map((url, index) => (
                      <div key={index} className="border rounded p-2">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {url.split('/').pop() || `Resource ${index + 1}`}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-sm text-gray-500">Added: {formatDate(caseStudy.createdAt)}</span>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
