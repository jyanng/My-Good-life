import { Profile } from "@shared/schema";

interface StrengthsSectionProps {
  profile: Profile;
  studentName: string;
}

export default function StrengthsSection({ profile, studentName }: StrengthsSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Strengths & Identity</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">What I like</h4>
          {profile.likes && profile.likes.length > 0 ? (
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {profile.likes.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No likes added yet</p>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">What I dislike</h4>
          {profile.dislikes && profile.dislikes.length > 0 ? (
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {profile.dislikes.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No dislikes added yet</p>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">What I can do well</h4>
          {profile.strengths && profile.strengths.length > 0 ? (
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {profile.strengths.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No strengths added yet</p>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">What people like about me</h4>
          {profile.peopleAppreciate && profile.peopleAppreciate.length > 0 ? (
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {profile.peopleAppreciate.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No appreciated qualities added yet</p>
          )}
        </div>
        
        {/* Identity Sections */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">What is important to me</h4>
          {profile.importantToMe && profile.importantToMe.length > 0 ? (
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {profile.importantToMe.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No important things added yet</p>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">How best to support me</h4>
          {profile.bestSupport && profile.bestSupport.length > 0 ? (
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {profile.bestSupport.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No support strategies added yet</p>
          )}
        </div>
        
        {profile.importantToFamily && profile.importantToFamily.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">What is important to my family</h4>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {profile.importantToFamily.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {profile.bestSupportFamily && profile.bestSupportFamily.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">How best to support my family</h4>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {profile.bestSupportFamily.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
