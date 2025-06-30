import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/layout/Navbar";
import RichTextEditor from "@/components/songs/RichTextEditor";
import CustomStyleSelect from "@/components/songs/CustomStyleSelect";
import { Song, Category } from "@/types";
import { getSongById, createSong, updateSong, getAllCategories } from "@/services/song-service";
import { useAuth } from "@/hooks/use-auth-context";

const SongForm = () => {
  const [searchParams] = useSearchParams();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [key, setKey] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [notes, setNotes] = useState("");
  const [copyright, setCopyright] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [style, setStyle] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: songId } = useParams<{ id: string }>();
  const isEditing = !!songId;

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (isEditing && songId) {
      loadSong(songId);
    } else {
      // Cargar datos desde parámetros URL (importación)
      loadFromUrlParams();
    }
  }, [songId, isEditing, searchParams]);

  const loadFromUrlParams = () => {
    console.log("🎵 [SongForm] Cargando datos desde parámetros URL");
    
    const titleParam = searchParams.get('title');
    const authorParam = searchParams.get('author');
    const keyParam = searchParams.get('key');
    const lyricsParam = searchParams.get('lyrics');
    const notesParam = searchParams.get('notes');
    const copyrightParam = searchParams.get('copyright');
    const youtubeParam = searchParams.get('youtubeUrl');
    const spotifyParam = searchParams.get('spotifyUrl');

    console.log("🎵 [SongForm] Parámetros encontrados:", {
      title: titleParam,
      author: authorParam,
      key: keyParam,
      lyrics: lyricsParam ? lyricsParam.substring(0, 100) + "..." : null,
      notes: notesParam,
      copyright: copyrightParam,
      youtubeUrl: youtubeParam,
      spotifyUrl: spotifyParam
    });

    if (titleParam) {
      setTitle(titleParam);
      console.log("🎵 [SongForm] Título cargado:", titleParam);
    }
    if (authorParam) {
      setAuthor(authorParam);
      console.log("🎵 [SongForm] Autor cargado:", authorParam);
    }
    if (keyParam) {
      setKey(keyParam);
      console.log("🎵 [SongForm] Tonalidad cargada:", keyParam);
    }
    if (lyricsParam) {
      setLyrics(lyricsParam);
      console.log("🎵 [SongForm] Letra cargada, longitud:", lyricsParam.length);
    }
    if (notesParam) {
      setNotes(notesParam);
      console.log("🎵 [SongForm] Notas cargadas:", notesParam);
    }
    if (copyrightParam) {
      setCopyright(copyrightParam);
      console.log("🎵 [SongForm] Copyright cargado:", copyrightParam);
    }
    if (youtubeParam) {
      setYoutubeUrl(youtubeParam);
      console.log("🎵 [SongForm] YouTube URL cargada:", youtubeParam);
    }
    if (spotifyParam) {
      setSpotifyUrl(spotifyParam);
      console.log("🎵 [SongForm] Spotify URL cargada:", spotifyParam);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadSong = async (id: string) => {
    setIsLoading(true);
    try {
      const song = await getSongById(id);
      if (song) {
        setTitle(song.title);
        setAuthor(song.author || "");
        setKey(song.key || "");
        setLyrics(song.lyrics || "");
        setNotes(song.notes || "");
        setCopyright(song.copyright || "");
        setYoutubeUrl(song.youtubeUrl || "");
        setSpotifyUrl(song.spotifyUrl || "");
        setStyle(song.style || "");
        setSelectedCategories(song.categories || []);
      } else {
        toast({
          title: "Error",
          description: "Song not found",
          variant: "destructive",
        });
        navigate("/songs");
      }
    } catch (error) {
      console.error("Error loading song:", error);
      toast({
        title: "Error",
        description: "Failed to load song",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a song",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const songData: Omit<Song, 'id' | 'createdAt' | 'updatedAt'> = {
        title,
        author: author || null,
        key: key || null,
        lyrics: lyrics || null,
        notes: notes || null,
        copyright: copyright || null,
        youtubeUrl: youtubeUrl || null,
        spotifyUrl: spotifyUrl || null,
        style: style || null,
        categories: selectedCategories,
        userId: user.id,
        isPublic: false,
        sharedWith: [],
        isFavorite: false,
        rating: null,
      };

      if (isEditing && songId) {
        await updateSong(songId, songData, user.id);
      } else {
        await createSong(songData, user.id);
      }

      toast({
        title: "Success",
        description: isEditing ? "Song updated successfully" : "Song created successfully",
      });

      navigate("/songs");
    } catch (error) {
      console.error("Error saving song:", error);
      toast({
        title: "Error",
        description: "Failed to save song",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading song...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{isEditing ? "Edit Song" : "New Song"}</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit song details" : "Enter song details"}</CardTitle>
            <CardDescription>
              Fill out the form to {isEditing ? "update" : "create"} a song.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  type="text"
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="key">Key</Label>
                <Select value={key} onValueChange={setKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select key" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No key</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="C#">C#</SelectItem>
                    <SelectItem value="Db">Db</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="D#">D#</SelectItem>
                    <SelectItem value="Eb">Eb</SelectItem>
                    <SelectItem value="E">E</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                    <SelectItem value="F#">F#</SelectItem>
                    <SelectItem value="Gb">Gb</SelectItem>
                    <SelectItem value="G">G</SelectItem>
                    <SelectItem value="G#">G#</SelectItem>
                    <SelectItem value="Ab">Ab</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="A#">A#</SelectItem>
                    <SelectItem value="Bb">Bb</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="style">Musical Style</Label>
                <CustomStyleSelect value={style} onValueChange={setStyle} />
              </div>
            </div>
            
            <div>
              <Label htmlFor="lyrics">Lyrics</Label>
              <RichTextEditor
                value={lyrics}
                onChange={setLyrics}
                placeholder="Enter song lyrics here..."
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about the song..."
              />
            </div>
            
            <div>
              <Label htmlFor="copyright">Copyright</Label>
              <Input
                type="text"
                id="copyright"
                value={copyright}
                onChange={(e) => setCopyright(e.target.value)}
                placeholder="Copyright information..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="youtubeUrl">YouTube URL</Label>
                <Input
                  type="url"
                  id="youtubeUrl"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <Label htmlFor="spotifyUrl">Spotify URL</Label>
                <Input
                  type="url"
                  id="spotifyUrl"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  placeholder="https://open.spotify.com/track/..."
                />
              </div>
            </div>
            
            {categories.length > 0 && (
              <div>
                <Label>Categories</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) => 
                          handleCategoryChange(category.id, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={category.id}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Song"}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default SongForm;
