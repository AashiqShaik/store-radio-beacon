import { useState } from 'react';
import { Upload, Calendar, Clock, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface UploadedContent {
  id: string;
  name: string;
  duration: string;
  uploadDate: Date;
  type: 'audio' | 'playlist';
}

interface ScheduledContent {
  id: string;
  contentId: string;
  contentName: string;
  startTime: string;
  endTime: string;
  date: string;
  repeat: 'none' | 'daily' | 'weekly';
}

interface ContentUploadProps {
  deviceId: string;
  deviceName: string;
}

export const ContentUpload = ({ deviceId, deviceName }: ContentUploadProps) => {
  const [uploadedContent, setUploadedContent] = useState<UploadedContent[]>([
    {
      id: 'content-1',
      name: 'Store Announcement.mp3',
      duration: '2:30',
      uploadDate: new Date(),
      type: 'audio'
    },
    {
      id: 'content-2',
      name: 'Special Promotion.mp3',
      duration: '1:45',
      uploadDate: new Date(),
      type: 'audio'
    }
  ]);

  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>([
    {
      id: 'schedule-1',
      contentId: 'content-1',
      contentName: 'Store Announcement.mp3',
      startTime: '09:00',
      endTime: '09:03',
      date: '2024-01-15',
      repeat: 'daily'
    }
  ]);

  const [newSchedule, setNewSchedule] = useState<{
    contentId: string;
    startTime: string;
    endTime: string;
    date: string;
    repeat: 'none' | 'daily' | 'weekly';
  }>({
    contentId: '',
    startTime: '',
    endTime: '',
    date: '',
    repeat: 'none'
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newContent: UploadedContent = {
        id: `content-${Date.now()}`,
        name: file.name,
        duration: '0:00', // Would be calculated from actual file
        uploadDate: new Date(),
        type: 'audio'
      };
      
      setUploadedContent(prev => [...prev, newContent]);
      
      toast({
        title: "Content uploaded",
        description: `${file.name} has been uploaded successfully`,
      });
    }
  };

  const handleScheduleContent = () => {
    if (!newSchedule.contentId || !newSchedule.startTime || !newSchedule.date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const content = uploadedContent.find(c => c.id === newSchedule.contentId);
    if (!content) return;

    const schedule: ScheduledContent = {
      id: `schedule-${Date.now()}`,
      contentId: newSchedule.contentId,
      contentName: content.name,
      startTime: newSchedule.startTime,
      endTime: newSchedule.endTime || newSchedule.startTime,
      date: newSchedule.date,
      repeat: newSchedule.repeat
    };

    setScheduledContent(prev => [...prev, schedule]);
    setNewSchedule({
      contentId: '',
      startTime: '',
      endTime: '',
      date: '',
      repeat: 'none'
    });

    toast({
      title: "Content scheduled",
      description: `${content.name} has been scheduled for ${newSchedule.date} at ${newSchedule.startTime}`,
    });
  };

  const removeSchedule = (scheduleId: string) => {
    setScheduledContent(prev => prev.filter(s => s.id !== scheduleId));
    toast({
      title: "Schedule removed",
      description: "The scheduled content has been removed",
    });
  };

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800/80">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Content</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-slate-300 mb-4">
            Upload content for: <span className="font-medium text-white">{deviceName}</span>
          </div>
          
          <div>
            <Label htmlFor="file-upload" className="text-slate-300">
              Select audio file
            </Label>
            <Input
              id="file-upload"
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="bg-slate-700 border-slate-600 text-white mt-2"
            />
          </div>

          {uploadedContent.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2">Uploaded Content</h4>
              <div className="space-y-2">
                {uploadedContent.map((content) => (
                  <div key={content.id} className="flex items-center justify-between bg-slate-700/50 p-2 rounded">
                    <div className="flex items-center space-x-2">
                      <Music2 className="h-4 w-4 text-blue-400" />
                      <span className="text-white text-sm">{content.name}</span>
                    </div>
                    <span className="text-slate-400 text-xs">{content.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-800/80">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Schedule Content</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Content</Label>
              <Select value={newSchedule.contentId} onValueChange={(value) => setNewSchedule(prev => ({ ...prev, contentId: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select content" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {uploadedContent.map((content) => (
                    <SelectItem key={content.id} value={content.id} className="text-white hover:bg-slate-600">
                      {content.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300">Date</Label>
              <Input
                type="date"
                value={newSchedule.date}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, date: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Start Time</Label>
              <Input
                type="time"
                value={newSchedule.startTime}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">End Time (Optional)</Label>
              <Input
                type="time"
                value={newSchedule.endTime}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, endTime: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Repeat</Label>
              <Select value={newSchedule.repeat} onValueChange={(value: 'none' | 'daily' | 'weekly') => setNewSchedule(prev => ({ ...prev, repeat: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="none" className="text-white hover:bg-slate-600">No repeat</SelectItem>
                  <SelectItem value="daily" className="text-white hover:bg-slate-600">Daily</SelectItem>
                  <SelectItem value="weekly" className="text-white hover:bg-slate-600">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleScheduleContent} className="w-full bg-blue-600 hover:bg-blue-700">
            <Clock className="h-4 w-4 mr-2" />
            Schedule Content
          </Button>

          {scheduledContent.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2">Scheduled Content</h4>
              <div className="space-y-2">
                {scheduledContent.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between bg-slate-700/50 p-3 rounded">
                    <div>
                      <div className="text-white text-sm font-medium">{schedule.contentName}</div>
                      <div className="text-slate-400 text-xs">
                        {schedule.date} at {schedule.startTime}
                        {schedule.endTime && ` - ${schedule.endTime}`}
                        {schedule.repeat !== 'none' && ` (${schedule.repeat})`}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSchedule(schedule.id)}
                      className="bg-red-600/20 border-red-600 text-red-400 hover:bg-red-600/30"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
