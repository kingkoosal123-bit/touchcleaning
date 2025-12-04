import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Location {
  id: string;
  area_name: string;
  description: string | null;
  suburbs: string[];
  is_active: boolean | null;
  display_order: number | null;
}

const AdminCMSLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    area_name: "",
    description: "",
    suburbs: "",
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from("cms_locations")
      .select("*")
      .order("display_order");

    if (error) {
      toast.error("Failed to fetch locations");
      return;
    }
    setLocations(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const suburbsArray = formData.suburbs.split("\n").filter(s => s.trim());

    const payload = {
      area_name: formData.area_name,
      description: formData.description || null,
      suburbs: suburbsArray,
      is_active: formData.is_active,
      display_order: formData.display_order,
    };

    if (editingLocation) {
      const { error } = await supabase
        .from("cms_locations")
        .update(payload)
        .eq("id", editingLocation.id);

      if (error) {
        toast.error("Failed to update location");
        return;
      }
      toast.success("Location updated successfully");
    } else {
      const { error } = await supabase.from("cms_locations").insert(payload);

      if (error) {
        toast.error("Failed to create location");
        return;
      }
      toast.success("Location created successfully");
    }

    setDialogOpen(false);
    resetForm();
    fetchLocations();
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      area_name: location.area_name,
      description: location.description || "",
      suburbs: (location.suburbs || []).join("\n"),
      is_active: location.is_active !== false,
      display_order: location.display_order || 0,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    const { error } = await supabase.from("cms_locations").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete location");
      return;
    }
    toast.success("Location deleted successfully");
    fetchLocations();
  };

  const resetForm = () => {
    setEditingLocation(null);
    setFormData({
      area_name: "",
      description: "",
      suburbs: "",
      is_active: true,
      display_order: 0,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Locations Management</h1>
            <p className="text-muted-foreground">Manage service areas displayed on the website</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Add Location</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingLocation ? "Edit Location" : "Add New Location"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="area_name">Area Name</Label>
                  <Input
                    id="area_name"
                    value={formData.area_name}
                    onChange={(e) => setFormData({ ...formData, area_name: e.target.value })}
                    placeholder="e.g., Sydney CBD"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suburbs">Suburbs (one per line)</Label>
                  <Textarea
                    id="suburbs"
                    value={formData.suburbs}
                    onChange={(e) => setFormData({ ...formData, suburbs: e.target.value })}
                    rows={5}
                    placeholder="Circular Quay&#10;Barangaroo&#10;Darling Harbour"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingLocation ? "Update" : "Create"} Location</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Service Locations</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Area</TableHead>
                    <TableHead>Suburbs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-medium">{location.area_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {(location.suburbs || []).slice(0, 3).map((suburb, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {suburb}
                            </Badge>
                          ))}
                          {(location.suburbs || []).length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{location.suburbs.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={location.is_active ? "default" : "secondary"}>
                          {location.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(location)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(location.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCMSLocations;