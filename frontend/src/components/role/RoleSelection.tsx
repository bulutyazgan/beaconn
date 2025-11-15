import type { UserRole } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, HandHelping } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (role: UserRole) => void;
}

export function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background-primary p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">Emergency Response System</h1>
          <p className="text-gray-400">Choose your role to get started</p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Victim Role */}
          <Card className="glass-hover cursor-pointer group border-accent-red/30 bg-accent-red/5" onClick={() => onSelectRole('victim')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 rounded-full bg-accent-red/20 group-hover:bg-accent-red/30 transition-colors">
                <Heart className="w-12 h-12 text-accent-red" />
              </div>
              <CardTitle className="text-2xl">I Need Help</CardTitle>
              <CardDescription className="text-base">
                Request assistance and access emergency resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <span className="text-accent-red">•</span>
                <span>Request immediate help for yourself or others</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent-red">•</span>
                <span>View nearby emergency resources and shelters</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent-red">•</span>
                <span>Track your help request status</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent-red">•</span>
                <span>Receive critical alerts and updates</span>
              </div>
              <div className="mt-6">
                <Button variant="glass" className="w-full bg-accent-red/30 hover:bg-accent-red/40 border-accent-red/50 text-white">
                  Select as Victim
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Responder Role */}
          <Card className="glass-hover cursor-pointer group border-accent-green/30 bg-accent-green/5" onClick={() => onSelectRole('responder')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 rounded-full bg-accent-green/20 group-hover:bg-accent-green/30 transition-colors">
                <HandHelping className="w-12 h-12 text-accent-green" />
              </div>
              <CardTitle className="text-2xl">I Want to Provide Help</CardTitle>
              <CardDescription className="text-base">
                Respond to requests and coordinate relief efforts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <span className="text-accent-green">•</span>
                <span>See all nearby help requests on the map</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent-green">•</span>
                <span>Claim and respond to specific requests</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent-green">•</span>
                <span>Filter by urgency and type of help needed</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent-green">•</span>
                <span>Coordinate with emergency resources</span>
              </div>
              <div className="mt-6">
                <Button variant="glass" className="w-full bg-accent-green/30 hover:bg-accent-green/40 border-accent-green/50 text-white">
                  Select as Responder
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500">
          <p>Your selection will be saved and can be changed later in settings</p>
        </div>
      </div>
    </div>
  );
}
