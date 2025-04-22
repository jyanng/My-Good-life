import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CaseStudy } from "@shared/schema";
import { DOMAINS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CaseStudyCard from "@/components/case-studies/CaseStudyCard";

export default function CaseStudies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  
  // Fetch case studies
  const { data: caseStudies, isLoading } = useQuery<CaseStudy[]>({
    queryKey: ["/api/case-studies"],
  });
  
  // Filter case studies based on search query and selected domains
  const filteredCaseStudies = caseStudies?.filter(study => {
    const matchesSearch = 
      searchQuery === "" || 
      study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.content.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesDomains = 
      selectedDomains.length === 0 || 
      selectedDomains.some(domain => study.domains?.includes(domain));
      
    return matchesSearch && matchesDomains;
  });
  
  // Toggle domain selection
  const toggleDomain = (domainId: string) => {
    if (selectedDomains.includes(domainId)) {
      setSelectedDomains(selectedDomains.filter(d => d !== domainId));
    } else {
      setSelectedDomains([...selectedDomains, domainId]);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDomains([]);
  };

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Case Study Library</h1>
          <p className="mt-1 text-gray-600">Explore examples of successful Good Life Plans and stories</p>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="space-y-4">
          <Input
            placeholder="Search case studies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          
          <div>
            <h3 className="text-sm font-medium mb-2">Filter by Domain:</h3>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map(domain => (
                <Badge
                  key={domain.id}
                  variant={selectedDomains.includes(domain.id) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    selectedDomains.includes(domain.id) 
                      ? domain.bgClass + " text-white" 
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => toggleDomain(domain.id)}
                >
                  {domain.name}
                </Badge>
              ))}
              
              {(selectedDomains.length > 0 || searchQuery) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2" 
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Case Studies Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredCaseStudies && filteredCaseStudies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCaseStudies.map(caseStudy => (
            <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-x mx-auto text-gray-400 mb-4">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            <path d="m14.5 7-5 5" />
            <path d="m9.5 7 5 5" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No case studies found</h3>
          <p className="text-gray-500">
            {searchQuery || selectedDomains.length > 0
              ? "No case studies match your current filters. Try broadening your search."
              : "There are no case studies available yet."}
          </p>
          {(searchQuery || selectedDomains.length > 0) && (
            <Button onClick={clearFilters} className="mt-4">
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
