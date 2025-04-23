import React from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TemplateItem {
  title: string;
  description: string;
  fileName: string;
}

export default function PlanTemplatesPage() {
  // Phase 1 Templates
  const phase1Templates: TemplateItem[] = [
    {
      title: "Understanding me",
      description: "Template to help students explore and document their personal interests, strengths, and preferences.",
      fileName: "understanding-me.pdf"
    },
    {
      title: "Understanding my family",
      description: "Template for mapping family relationships, support systems, and important connections.",
      fileName: "understanding-my-family.pdf"
    },
    {
      title: "Understanding my life",
      description: "Comprehensive template for students to reflect on their life experiences and aspirations.",
      fileName: "understanding-my-life.pdf"
    },
    {
      title: "Understanding my community",
      description: "Template to help students identify and connect with community resources and opportunities.",
      fileName: "understanding-my-community.pdf"
    },
    {
      title: "My Life Profile",
      description: "Template for creating a complete personal profile that can be shared with support networks.",
      fileName: "my-life-profile.pdf"
    }
  ];

  // Phase 2 Templates
  const phase2Templates: TemplateItem[] = [
    {
      title: "Envisioning",
      description: "Template to guide students through the process of envisioning their future across domains.",
      fileName: "envisioning.pdf"
    },
    {
      title: "Future me",
      description: "Activity template for students to visualize and articulate their future selves.",
      fileName: "future-me.pdf"
    },
    {
      title: "Realise my vision",
      description: "Template with structured goal-setting frameworks to turn visions into actionable plans.",
      fileName: "realise-my-vision.pdf"
    }
  ];

  // Phase 3 Templates
  const phase3Templates: TemplateItem[] = [
    {
      title: "How might I connect",
      description: "Template with strategies for building and maintaining meaningful connections and relationships.",
      fileName: "how-might-i-connect.pdf"
    },
    {
      title: "My Good Life Plan",
      description: "Comprehensive template for compiling all plan elements into a cohesive Good Life Plan.",
      fileName: "my-good-life-plan.pdf"
    },
    {
      title: "Resource Mapping",
      description: "Template for identifying and organizing resources needed to support Good Life goals.",
      fileName: "resource-mapping.pdf"
    }
  ];

  const handleDownload = (fileName: string) => {
    // In a real application, this would be a link to the actual PDF file
    alert(`Downloading ${fileName}...`);
  };

  const TemplateCard = ({ template }: { template: TemplateItem }) => (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{template.title}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => handleDownload(template.fileName)}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Plan Templates</h1>
        <p className="mt-1 text-gray-600">
          Download ready-to-use templates to support your MyGoodLife planning process
        </p>
      </div>

      <Tabs defaultValue="phase1" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="phase1">Phase 1: Understand</TabsTrigger>
          <TabsTrigger value="phase2">Phase 2: Involve</TabsTrigger>
          <TabsTrigger value="phase3">Phase 3: Connect</TabsTrigger>
        </TabsList>

        <TabsContent value="phase1" className="mt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Phase 1: Understand</h2>
              <p className="text-gray-600">Templates to help understand the student's background, preferences, and context</p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {phase1Templates.map((template, index) => (
                <TemplateCard key={index} template={template} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="phase2" className="mt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Phase 2: Involve</h2>
              <p className="text-gray-600">Templates focused on developing visions and planning for the future</p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {phase2Templates.map((template, index) => (
                <TemplateCard key={index} template={template} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="phase3" className="mt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Phase 3: Connect</h2>
              <p className="text-gray-600">Templates for building connections and implementing the Good Life Plan</p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {phase3Templates.map((template, index) => (
                <TemplateCard key={index} template={template} />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}