import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { UserProfile, getProfile, createProfile, updateProfile, deleteProfile } from '@/lib/api';
import { User, Edit, Trash2, Save } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    goals: '',
    notes: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const savedProfile = await getProfile();
        if (savedProfile) {
          setProfile(savedProfile);
          setFormData({
            name: savedProfile.name,
            age: savedProfile.age.toString(),
            gender: savedProfile.gender,
            goals: savedProfile.goals,
            notes: savedProfile.notes,
          });
        } else {
          setIsEditing(true);
        }
      } catch (err) {
        toast.error('Failed to fetch profile');
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.age || !formData.gender) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newProfile: UserProfile = {
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      goals: formData.goals,
      notes: formData.notes,
    };

    try {
      if (profile) {
        await updateProfile(profile.id!, newProfile);
        setProfile({ ...newProfile, id: profile.id });
        toast.success('Profile updated successfully');
      } else {
        await createProfile(newProfile);
        setProfile(newProfile);
        toast.success('Profile created successfully');
      }
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile');
    }
  };

  const handleDelete = async () => {
    if (!profile?.id) return;

    try {
      await deleteProfile(profile.id);
      setProfile(null);
      setIsEditing(true);
      setFormData({ name: '', age: '', gender: '', goals: '', notes: '' });
      toast.success('Profile deleted successfully');
    } catch {
      toast.error('Failed to delete profile');
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your personal information and wellness goals
        </p>
      </div>

      <Card className="card-elevated p-8">
        {isEditing ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {profile ? 'Edit Profile' : 'Create Your Profile'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {profile ? 'Update your information' : 'Get started with your wellness journey'}
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Age"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Non-binary">Non-binary</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="goals">Goals</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  placeholder="What are your wellness goals?"
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes?"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {profile ? 'Save Changes' : 'Create Profile'}
              </Button>
              {profile && (
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div className="flex gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{profile?.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {profile?.age} years old • {profile?.gender}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Profile?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your profile and all associated data. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {profile?.goals && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">GOALS</h3>
                <p className="text-sm">{profile.goals}</p>
              </div>
            )}

            {profile?.notes && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">NOTES</h3>
                <p className="text-sm">{profile.notes}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {profile && !isEditing && (
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => navigate('/daily-log')}>
            Go to Daily Log
          </Button>
        </div>
      )}
    </div>
  );
};

export default Profile;