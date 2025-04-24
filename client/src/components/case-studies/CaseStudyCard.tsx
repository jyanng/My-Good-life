import { useState } from "react";
import { CaseStudy } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DOMAINS } from "@/lib/constants";
import { formatDate } from "@/lib/constants";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

// Format vision statement to use the "When I am X years old, I will..." format
function formatVisionStatement(vision: string | null): string {
  if (!vision) return "";
  
  try {
    // Check if this is already in JSON format
    if (vision.startsWith('{')) {
      const visionData = JSON.parse(vision);
      return `"When I am ${visionData.age || 30} years old, I will ${visionData.text}"`;
    }
    
    // If it doesn't already start with the format, add it
    if (!vision.toLowerCase().startsWith('when i am')) {
      return `"When I am 30 years old, I will ${vision}"`;
    }
    
    // Otherwise just return the original with quotes
    return `"${vision}"`;
  } catch (e) {
    // If there's an error parsing JSON, return the original
    if (!vision.toLowerCase().startsWith('when i am')) {
      return `"When I am 30 years old, I will ${vision}"`;
    }
    return `"${vision}"`;
  }
}

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
        {caseStudy.goodLifeVision && (
          <div className="mb-3 pb-3 border-b border-purple-100">
            <div className="flex items-center mb-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-xs font-semibold text-purple-700 uppercase">Good Life Vision</span>
            </div>
            <p className="text-purple-800 text-sm italic line-clamp-2">{formatVisionStatement(caseStudy.goodLifeVision)}</p>
          </div>
        )}
      
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
                <div className="my-4 rounded-lg overflow-hidden border border-purple-200">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-4 py-3">
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"></path>
                        <path d="m7 16.5-4.74-2.85"></path>
                        <path d="m7 16.5 5-3"></path>
                        <path d="M7 16.5v5.17"></path>
                        <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"></path>
                        <path d="m17 16.5-5-3"></path>
                        <path d="m17 16.5 4.74-2.85"></path>
                        <path d="M17 16.5v5.17"></path>
                        <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"></path>
                        <path d="M12 10.5 7.26 7.65"></path>
                        <path d="m12 10.5 4.74-2.85"></path>
                        <path d="M12 10.5V15"></path>
                      </svg>
                      Good Life Vision
                    </h3>
                  </div>
                  
                  <div className="bg-gradient-to-b from-purple-50 to-white p-4">
                    <blockquote className="text-lg italic text-purple-900 mb-4 border-l-4 border-purple-300 pl-4">
                      {formatVisionStatement(caseStudy.goodLifeVision)}
                    </blockquote>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Domain Focus Areas</h4>
                      <div className="flex flex-wrap gap-3">
                        {domainInfo.map(domain => domain && (
                          <div key={domain.id} className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${domain.bgClass} mr-1`}></div>
                            <span className={`text-sm ${domain.textClass}`}>{domain.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-600">
                      <p className="mb-2">This vision statement represents the individual's aspirations across multiple domains of their Good Life Plan. It provides direction and purpose for setting specific goals and measuring progress.</p>
                    </div>
                  </div>
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
