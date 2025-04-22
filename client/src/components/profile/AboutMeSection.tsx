import { Student, Profile, DomainConfidence } from "@shared/schema";
import { Button } from "@/components/ui/button";
import DomainSlider from "./DomainSlider";
import TagCloud from "./TagCloud";
import StrengthsSection from "./StrengthsSection";

interface AboutMeSectionProps {
  student: Student;
  profile?: Profile;
  domainConfidence?: DomainConfidence;
  onViewFullPlan: () => void;
}

export default function AboutMeSection({ 
  student, 
  profile, 
  domainConfidence,
  onViewFullPlan 
}: AboutMeSectionProps) {
  if (!profile) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
        <h3 className="text-lg font-medium mb-4">No Profile Information</h3>
        <p className="text-gray-500 mb-6">This student doesn't have an "About Me" profile yet.</p>
        <Button>Create Profile</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
            {student.avatarUrl ? (
              <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary flex items-center justify-center text-white text-4xl font-semibold">
                {student.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
        
        <div className="md:w-3/4">
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{student.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Age</p>
              <p className="font-medium">{student.age || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{student.email || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{student.phone || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">School</p>
              <p className="font-medium">{student.school || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Graduation Date</p>
              <p className="font-medium">{student.graduationDate || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Strengths and Identity Section */}
      <StrengthsSection profile={profile} studentName={student.name} />
      
      {/* Tag Cloud */}
      <div>
        <h3 className="text-lg font-medium mb-4">Personality & Interests</h3>
        <TagCloud tags={profile.personalityTags || []} />
      </div>
      
      {/* Domain Sliders */}
      {domainConfidence && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Life Domain Confidence</h3>
            <Button variant="outline" size="sm" onClick={onViewFullPlan}>
              View Full Plan
            </Button>
          </div>
          <div className="space-y-4">
            <DomainSlider 
              domain="safe" 
              label="Safe" 
              value={domainConfidence.safeScore || 0} 
              readOnly 
            />
            <DomainSlider 
              domain="healthy" 
              label="Healthy" 
              value={domainConfidence.healthyScore || 0} 
              readOnly 
            />
            <DomainSlider 
              domain="engaged" 
              label="Engaged" 
              value={domainConfidence.engagedScore || 0} 
              readOnly 
            />
            <DomainSlider 
              domain="connected" 
              label="Connected" 
              value={domainConfidence.connectedScore || 0} 
              readOnly 
            />
            <DomainSlider 
              domain="independent" 
              label="Independent" 
              value={domainConfidence.independentScore || 0} 
              readOnly 
            />
            <DomainSlider 
              domain="included" 
              label="Included & Heard" 
              value={domainConfidence.includedScore || 0} 
              readOnly 
            />
          </div>
        </div>
      )}
    </div>
  );
}
