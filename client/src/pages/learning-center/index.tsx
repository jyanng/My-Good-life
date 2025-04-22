import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LearningModule } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoModule from "@/components/learning/VideoModule";

export default function LearningCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  // Fetch learning modules
  const { data: learningModules, isLoading } = useQuery<LearningModule[]>({
    queryKey: ["/api/learning-modules"],
  });
  
  // Get unique categories
  const categories = learningModules 
    ? [...new Set(learningModules.map(module => module.category))]
    : [];
  
  // Filter modules based on search query and category
  const filteredModules = learningModules?.filter(module => {
    const matchesSearch = 
      searchQuery === "" || 
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = 
      selectedCategory === "" || 
      module.category === selectedCategory;
      
    return matchesSearch && matchesCategory;
  });
  
  // Group modules by category
  const modulesByCategory = filteredModules?.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, LearningModule[]>) || {};
  
  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
  };

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Center</h1>
          <p className="mt-1 text-gray-600">Access training modules and resources for effective facilitation</p>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="space-y-4">
          <Input
            placeholder="Search learning modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          
          <div>
            <h3 className="text-sm font-medium mb-2">Filter by Category:</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category === selectedCategory ? "" : category)}
                >
                  {formatCategoryName(category)}
                </Badge>
              ))}
              
              {(selectedCategory || searchQuery) && (
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
      
      {/* Learning Modules */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredModules && filteredModules.length > 0 ? (
        <div className="space-y-8">
          {/* Display as tabs if category filter is not applied */}
          {!selectedCategory ? (
            <Tabs defaultValue={categories[0]} className="bg-white rounded-lg shadow">
              <div className="px-6 pt-6">
                <TabsList className="w-full">
                  {categories.map(category => (
                    <TabsTrigger key={category} value={category} className="flex-1">
                      {formatCategoryName(category)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              {categories.map(category => (
                <TabsContent key={category} value={category} className="p-6 focus:outline-none">
                  <h2 className="text-xl font-semibold mb-4">{formatCategoryName(category)}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modulesByCategory[category]?.map(module => (
                      <VideoModule key={module.id} module={module} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            // Display as regular grid if category filter is applied
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">{formatCategoryName(selectedCategory)}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modulesByCategory[selectedCategory]?.map(module => (
                  <VideoModule key={module.id} module={module} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video-off mx-auto text-gray-400 mb-4">
            <path d="M10.66 6H14a2 2 0 0 1 2 2v2.34l1 1L22 8v8" />
            <path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2l10 10Z" />
            <line x1="2" x2="22" y1="2" y2="22" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No learning modules found</h3>
          <p className="text-gray-500">
            {searchQuery || selectedCategory
              ? "No learning modules match your current filters. Try broadening your search."
              : "There are no learning modules available yet."}
          </p>
          {(searchQuery || selectedCategory) && (
            <Button onClick={clearFilters} className="mt-4">
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
