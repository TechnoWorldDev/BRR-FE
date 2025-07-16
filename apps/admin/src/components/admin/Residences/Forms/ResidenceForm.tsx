// ResidenceForm.tsx - refaktorisana verzija bez duplirane logike

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import type { z } from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LocationSelector from "@/components/admin/LocationSelector";

import FormHeader from "../../Headers/FormHeader";
import ImageUpload from "../../Forms/ImageUpload";
import UnsavedChangesWarning from "../../Forms/UnsavedChangesWarning";
import DiscardModal from "../../Modals/DiscardModal";
import { useDiscardWarning } from "@/hooks/useDiscardWarning";
import residence, {
  residenceSchema,
  ResidenceFormValues,
  initialResidenceValues,
  keyFeatureSchema,
  DevelopmentStatus,
  RentalPotential,
  highlightedAmenitySchema
} from "../../../../app/schemas/residence";
import { Check, Trash2, X } from "lucide-react";
import { API_BASE_URL, API_VERSION } from "@/app/constants/api";
import { useDebounce } from "@/hooks/useDebounce";
import Image from "next/image";
import MultipleImageUpload, {
  UploadedImage,
  EditModeImage as RemoteEditModeImage
} from "../../Forms/MultipleImageUpload";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import MultiSelect from "../../Forms/MultiSelect";
import { CountryAndCity } from "@/components/admin/Forms/CountryAndCity";

interface ResidenceFormProps {
  initialData?: Partial<ResidenceFormValues>;
  isEditing?: boolean;
}

interface Brand {
  id: string;
  name: string;
  description?: string;
  status: string;
  logo?: {
    id: string;
    originalFileName: string;
  };
}

interface LocalEditModeImage {
  preview: string;
  isFeatured: boolean;
  order: number;
  mediaId: string;
}

type KeyFeature = z.infer<typeof keyFeatureSchema>;

interface Amenity {
  id: string;
  name: string;
}

interface HighlightedAmenity {
  id: string;
  order: number;
}

// Interfejs za slike u edit modu
interface EditModeImage {
  preview: string;
  isFeatured: boolean;
  order: number;
  mediaId: string;
}

export default function ResidenceForm({ initialData = {}, isEditing = false }: ResidenceFormProps) {
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // State za brendove
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // State za key features
  const [keyFeatures, setKeyFeatures] = useState<KeyFeature[]>([]);
  const [isLoadingKeyFeatures, setIsLoadingKeyFeatures] = useState(false);

  const [images, setImages] = useState<(EditModeImage | UploadedImage)[]>([]);
  const [featuredImage, setFeaturedImage] = useState<EditModeImage | UploadedImage | null>(null);

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isLoadingAmenities, setIsLoadingAmenities] = useState(false);

  const [isLoadingResidence, setIsLoadingResidence] = useState(false);

  const form = useForm<ResidenceFormValues>({
    resolver: zodResolver(residenceSchema),
    defaultValues: {
      ...initialResidenceValues,
      ...initialData,
    },
  });

  // Provera da li forma ima nesačuvane promjene
  const hasUnsavedChanges = form.formState.isDirty;

  // Hook za upozorenje o nesačuvanim promjenama
  const {
    showDiscardModal,
    handleConfirmDiscard,
    handleCancelDiscard,
    navigateTo,
  } = useDiscardWarning({
    hasUnsavedChanges,
    onDiscard: () => {
      // Dodatne akcije pri odbacivanju ako su potrebne
    },
  });

  // Provera da li je forma validna za čuvanje
  const isSaveEnabled = useCallback(() => {
    return form.formState.isDirty && !form.formState.isValidating && Object.keys(form.formState.errors).length === 0;
  }, [form.formState]);

  // Funkcija za učitavanje brendova
  const fetchBrands = useCallback(async (page: number, search: string = "", reset: boolean = false) => {
    try {
      setIsLoadingBrands(true);
      const response = await fetch(
        `${API_BASE_URL}/api/${API_VERSION}/brands?page=${page}&limit=100${search ? `&query=${search}` : ""}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }

      const data = await response.json();
      setBrands(prev => reset ? data.data : [...prev, ...data.data]);
      setHasMore(data.pagination.page < data.pagination.totalPages);
      setCurrentPage(data.pagination.page);
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Failed to load brands");
    } finally {
      setIsLoadingBrands(false);
    }
  }, []);

  useEffect(() => {
    const fetchResidenceData = async () => {
      if (isEditing && !initialData?.id) {
        const residenceId = params?.id;
        if (residenceId) {
          try {
            setIsLoadingResidence(true);

            // 1. Dohvatamo podatke o rezidenciji
            const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/residences/${residenceId}`, {
              credentials: "include",
            });

            if (!response.ok) throw new Error("Failed to fetch residence detail");

            const json = await response.json();
            const data = json.data;

            console.log("Loaded residence data:", data);

            // 2. Učitavamo brendove paralelno
            let brandsPromise = Promise.resolve();
            if (data.brand?.id) {
              brandsPromise = fetchBrands(1, "", true);
            }

            // 3. Učitaj galeriju slika
            const galleryImages: EditModeImage[] = [];
            if (data.mainGallery && data.mainGallery.length > 0) {
              data.mainGallery.forEach((img: any, index: number) => {
                const isCurrentImageFeatured = data.featuredImage && data.featuredImage.id === img.id;
                galleryImages.push({
                  mediaId: img.id,
                  preview: `${API_BASE_URL}/api/${API_VERSION}/media/${img.id}/content`,
                  isFeatured: isCurrentImageFeatured,
                  order: index
                });
              });

              if (!data.featuredImage && galleryImages.length > 0) {
                galleryImages[0].isFeatured = true;
              }

              setImages(galleryImages);
              const featuredImg = galleryImages.find(img => img.isFeatured);
              if (featuredImg) {
                setFeaturedImage(featuredImg);
              }
            }

            // 4. Čekamo da se svi podaci učitaju
            await brandsPromise;

            // 5. Resetujemo formu NAKON što smo učitali sve potrebno
            form.reset({
              ...initialResidenceValues,
              name: data.name || "",
              status: data.status || "",
              developmentStatus: data.developmentStatus || "",
              subtitle: data.subtitle || "",
              description: data.description || "",
              budgetStartRange: data.budgetStartRange || "",
              budgetEndRange: data.budgetEndRange || "",
              address: data.address || "",
              latitude: data.latitude || 0,
              longitude: data.longitude || 0,
              countryId: data.country?.id || "",
              cityId: data.city?.id || "",
              brandId: data.brand?.id || "",
              rentalPotential: data.rentalPotential || "",
              websiteUrl: data.websiteUrl || "",
              yearBuilt: data.yearBuilt || "",
              floorSqft: data.floorSqft || "",
              staffRatio: data.staffRatio || 0,
              avgPricePerUnit: data.avgPricePerUnit || "",
              avgPricePerSqft: data.avgPricePerSqft || "",
              petFriendly: data.petFriendly === true,
              disabledFriendly: data.disabledFriendly === true,
              videoTourUrl: data.videoTourUrl || "",
              keyFeatures: data.keyFeatures || [],
              amenities: data.amenities || [],
              highlightedAmenities: data.highlightedAmenities?.map((ha: any) => ({
                id: ha.amenity?.id,
                order: ha.order,
              })) || [],
            }, {
              keepDefaultValues: false,
            });

            setIsLoadingResidence(false);

          } catch (error) {
            toast.error("Failed to load residence details");
            console.error("Error in fetchResidenceData:", error);
            setIsLoadingResidence(false);
          }
        }
      }
    };

    fetchResidenceData();
  }, [isEditing, initialData?.id, params?.id, form, fetchBrands]);


  useEffect(() => {
    fetchBrands(1, "", true);
  }, [fetchBrands]);

  // Učitaj brendove kada se pretraga promijeni
  useEffect(() => {
    if (debouncedSearch) {
      setCurrentPage(1);
      fetchBrands(1, debouncedSearch, true);
    }
  }, [debouncedSearch, fetchBrands]);

  // Handler za scroll (infinite loading) za brendove
  const handleBrandScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (
      target.scrollHeight - target.scrollTop <= target.clientHeight + 20 &&
      !isLoadingBrands &&
      hasMore
    ) {
      fetchBrands(currentPage + 1, searchQuery);
    }
  }, [currentPage, fetchBrands, hasMore, isLoadingBrands, searchQuery]);

  // Funkcija za dohvaćanje key features
  const fetchKeyFeatures = useCallback(async () => {
    try {
      setIsLoadingKeyFeatures(true);
      const response = await fetch(
        `${API_BASE_URL}/api/${API_VERSION}/key-features?limit=100&page=1`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to fetch key features");

      const data = await response.json();
      const features = data.data;
      setKeyFeatures(features);
    } catch (error) {
      console.error("Error fetching key features:", error);
      toast.error("Failed to load key features");
    } finally {
      setIsLoadingKeyFeatures(false);
    }
  }, []);

  // Funkcija za dohvaćanje amenities
  const fetchAmenities = useCallback(async () => {
    try {
      setIsLoadingAmenities(true);
      const response = await fetch(
        `${API_BASE_URL}/api/${API_VERSION}/amenities?limit=100&page=1`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to fetch amenities");

      const data = await response.json();
      const fetchedAmenities = data.data;
      setAmenities(fetchedAmenities);
    } catch (error) {
      console.error("Error fetching amenities:", error);
      toast.error("Failed to load amenities");
    } finally {
      setIsLoadingAmenities(false);
    }
  }, []);

  // Učitavamo key features i amenities samo jednom kada se komponenta mountuje
  useEffect(() => {
    const loadStaticData = async () => {
      await Promise.all([
        fetchKeyFeatures(),
        fetchAmenities()
      ]);
    };

    loadStaticData();
  }, [fetchKeyFeatures, fetchAmenities]);

  // Modifikovani handleSave koji podržava PUT u edit modu
  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const values = form.getValues();

      // Upload samo novih slika (one koje imaju file property)
      const newImages = images.filter((img): img is UploadedImage => 'file' in img);
      const uploadedImages = await Promise.all(
        newImages.map(async (image) => {
          const formData = new FormData();
          formData.append('file', image.file);

          const response = await fetch(
            `${API_BASE_URL}/api/${API_VERSION}/media?type=RESIDENCE`,
            {
              method: 'POST',
              credentials: 'include',
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to upload image ${image.file.name}`);
          }

          const data = await response.json();
          return {
            mediaId: data.data.id,
            isFeatured: image.isFeatured,
            order: image.order
          };
        })
      );

      // Kombinovati postojeće i nove slike
      const existingImages = images
        .filter((img): img is EditModeImage => 'mediaId' in img)
        .map(img => ({
          mediaId: img.mediaId,
          isFeatured: img.isFeatured,
          order: img.order
        }));

      const allImages = [...existingImages, ...uploadedImages];

      // Izdvajamo samo potrebne podatke za slanje
      const { id, country, city, ...restValues } = values;

      const dataToSend = {
        ...restValues,
        keyFeatures: values.keyFeatures?.map(feature => feature.id) || [],
        amenities: values.amenities?.map(amenity => amenity.id) || [],
        mainGallery: allImages.map(img => ({
          id: img.mediaId,
          order: img.order
        })),
        featuredImageId: allImages.find(img => img.isFeatured)?.mediaId || null,
        developmentStatus: values.developmentStatus as string,
        rentalPotential: values.rentalPotential as string,
        yearBuilt: values.yearBuilt,
        floorSqft: values.floorSqft,
        staffRatio: values.staffRatio,
        avgPricePerUnit: values.avgPricePerUnit,
        avgPricePerSqft: values.avgPricePerSqft,
        videoTourUrl: values.videoTourUrl || null
      };

      let response;

      if (isEditing) {
        // PUT zahtev za ažuriranje postojeće rezidencije
        const residenceId = params?.id || initialData?.id;
        if (!residenceId) throw new Error("Residence ID is missing");

        response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/residences/${residenceId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(dataToSend),
        });
      } else {
        // POST zahtev za kreiranje nove rezidencije
        response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/residences`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(dataToSend),
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} residence`);
      }

      toast.success(isEditing ? 'Residence updated successfully!' : 'Residence created successfully!');
      router.push('/residences');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler za brisanje
  const handleDelete = async () => {
    const residenceId = params?.id;

    if (!residenceId) {
      console.error("Residence ID is missing - cannot delete residence");
      toast.error("Cannot delete: residence ID is missing");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/residences/${residenceId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete residence');
      }

      toast.success('Residence deleted successfully');
      router.push('/residences');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete residence');
    } finally {
      setIsSubmitting(false);
      setShowDeleteDialog(false);
    }
  };

  // Handler za odbacivanje promjena
  const handleDiscard = () => {
    if (hasUnsavedChanges) {
      navigateTo("/residences");
    } else {
      router.push("/residences");
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-900/20 hover:bg-green-900/40 text-green-300 border-green-900/50";
      case "PENDING":
        return "bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-300 border-yellow-900/50";
      case "DRAFT":
        return "bg-gray-900/20 hover:bg-gray-900/40 text-gray-300 border-gray-900/50";
      case "DELETED":
        return "bg-red-900/20 hover:bg-red-900/40 text-red-300 border-red-900/50";
      default:
        return "";
    }
  };

  // 2. Dodajemo funkciju za promenu statusa
  const handleStatusChange = async (newStatus: "DRAFT" | "ACTIVE" | "DELETED" | "PENDING") => {
    // Umesto provere initialData?.id koja može sprečiti izvršavanje,
    // koristi params?.id koji će uvek biti dostupan u edit modu
    const residenceId = params?.id;

    if (!residenceId) {
      console.error("Residence ID is missing - cannot update status");
      return;
    }

    try {
      setIsSubmitting(true);

      console.log("Sending status update:", {
        residenceId,
        newStatus,
        url: `${API_BASE_URL}/api/${API_VERSION}/residences/${residenceId}/status`
      });

      const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/residences/${residenceId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Status update failed:", errorText);
        throw new Error(`Failed to update status: ${response.status}`);
      }

      // Ažuriraj vrednost u formi
      form.setValue("status", newStatus, { shouldDirty: true });
      toast.success(`Residence status updated to ${newStatus}`);
      router.refresh();
    } catch (error) {
      console.error("Status update error:", error);
      toast.error('Failed to update residence status');
    } finally {
      setIsSubmitting(false);
    }
  };
  // Render status bedža
  const renderStatusBadge = () => {
    if (!isEditing) return null;

    const allowedStatuses = ["DRAFT", "ACTIVE", "PENDING", "DELETED"] as const;

    return (
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <Select
            onValueChange={(newStatus) => {
              console.log("Status change triggered:", newStatus);
              field.onChange(newStatus);
              // Direktno prosleđujemo value bez provere
              handleStatusChange(newStatus as "DRAFT" | "ACTIVE" | "DELETED" | "PENDING");
            }}
            value={field.value || ""}
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-auto border-0 p-0 h-auto hover:bg-transparent focus:ring-0">
              <Badge
                className={`${getStatusBadgeStyle(field.value)} px-4 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer hover:opacity-80`}
              >
                {field.value || "DRAFT"}
              </Badge>
            </SelectTrigger>
            <SelectContent>
              {allowedStatuses.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                  className="text-sm"
                >
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    );
  };
  // Render akcija za status
  const renderStatusActions = () => {
    if (!isEditing) return null;

    // Prikazujemo dugmad samo ako je status PENDING
    const currentStatus = form.watch("status");
    if (currentStatus !== "PENDING") return null;

    return (
      <>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-green-900/20 hover:bg-green-900/40 text-green-300 border-green-900/50 transition-all duration-300"
            onClick={() => handleStatusChange("ACTIVE")}
            disabled={isSubmitting}
          >
            <Check className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-red-900/20 hover:bg-red-900/40 text-red-300 border-red-900/50 transition-all duration-300"
            onClick={() => setShowRejectDialog(true)}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>

        <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to reject this residence?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The residence will be marked as deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleStatusChange("DELETED");
                  setShowRejectDialog(false);
                }}
                className="bg-destructive text-white hover:bg-destructive/80 transition-colors cursor-pointer"
              >
                Reject
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  };

  // Render dugmeta za brisanje
  const renderDeleteButton = () => {
    if (!isEditing || form.watch("status") === "DELETED") return null;

    return (
      <>
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          className="cursor-pointer transition-colors"
          disabled={isSubmitting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this residence?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the residence
                and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-white hover:bg-destructive/80 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  };

  return (
    <>
      <FormHeader
        title={isEditing ? initialData.name || "Edit residence" : "Add new residence"}
        titleContent={renderStatusBadge()}
        titleActions={renderStatusActions()}
        extraButtons={renderDeleteButton()}
        onSave={handleSave}
        onDiscard={handleDiscard}
        saveButtonText={isEditing ? "Save changes" : "Add Residence"}
        saveButtonDisabled={!isSaveEnabled()}
        isSubmitting={isSubmitting}
      />

      {isLoadingResidence ? (
        <div className="w-full py-20 flex flex-col items-center justify-center space-y-4">
          {/* Spinner komponenta - možete koristiti vašu postojeću ili dodati novu */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading residence data...</p>
        </div>
      ) : (
        <div className="w-full mx-auto py-6">
          <Form {...form}>
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Information */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">General Information</h2>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter residence name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="websiteUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com"
                              value={field.value || ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brandId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Associated brand <span className="text-destructive">*</span></FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            onOpenChange={(open) => {
                              if (open && searchInputRef.current) {
                                setTimeout(() => {
                                  searchInputRef.current?.focus();
                                }, 100);
                              }
                            }}
                          >
                            <FormControl className="w-full">
                              <SelectTrigger>
                                <SelectValue placeholder="Select a brand" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <div className="px-2 py-2 sticky top-0 bg-background z-10">
                                <Input
                                  ref={searchInputRef}
                                  placeholder="Search brands..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="h-8"
                                  onKeyDown={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div
                                className="max-h-[300px] overflow-y-auto"
                                onScroll={handleBrandScroll}
                              >
                                {isLoadingBrands && brands.length === 0 ? (
                                  <div className="px-2 py-2 text-sm text-muted-foreground">
                                    Loading brands...
                                  </div>
                                ) : brands.length === 0 ? (
                                  <div className="px-2 py-2 text-sm text-muted-foreground">
                                    No brands found
                                  </div>
                                ) : (
                                  brands.map((brand) => (
                                    <SelectItem
                                      key={brand.id}
                                      value={brand.id}
                                      className="cursor-pointer"
                                    >
                                      <div className="flex items-center gap-2">
                                        {brand.logo && (
                                          <Image
                                            src={`${API_BASE_URL}/api/${API_VERSION}/media/${brand.logo.id}/content`}
                                            alt={brand.name}
                                            width={24}
                                            height={24}
                                            className="rounded-sm object-contain"
                                          />
                                        )}
                                        <span>{brand.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))
                                )}
                                {isLoadingBrands && brands.length > 0 && (
                                  <div className="px-2 py-2 text-sm text-muted-foreground text-center">
                                    Loading more brands...
                                  </div>
                                )}
                              </div>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormItem className="w-full col-span-2">
                      <FormLabel>Location <span className="text-destructive">*</span></FormLabel>
                      <CountryAndCity
                        defaultCountryId={form.watch("countryId")}
                        defaultCityId={form.watch("cityId")}
                        onCountrySelect={(countryId) => {
                          console.log("Country selected:", countryId);
                          form.setValue("countryId", countryId, { shouldValidate: true, shouldDirty: true });
                          // Resetujemo grad kada se promeni država
                          form.setValue("cityId", "", { shouldValidate: true, shouldDirty: true });
                        }}
                        onCitySelect={(cityId) => {
                          console.log("City selected:", cityId);
                          form.setValue("cityId", cityId, { shouldValidate: true, shouldDirty: true });
                        }}
                      />
                      <FormMessage />
                    </FormItem>

                    <h2 className="text-xl font-semibold mb-4 mt-8">Brief Overview</h2>

                    <FormField
                      control={form.control}
                      name="subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brief Subtitle <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Ex. Ritz Carton Residences Miami" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brief overview <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter brief overview" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Budget Information */}
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Budget Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="budgetStartRange"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Budget Start Range <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                  <Input type="number" min="0" placeholder="Enter starting budget" className="pl-6" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="budgetEndRange"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Budget End Range <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                  <Input type="number" min="0" placeholder="Enter ending budget" className="pl-6" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Location</h2>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <LocationSelector
                              value={{
                                address: field.value || "",
                                latitude: form.watch("latitude"),
                                longitude: form.watch("longitude"),
                              }}
                              onChange={(location) => {
                                field.onChange(location.address);
                                form.setValue("latitude", location.latitude);
                                form.setValue("longitude", location.longitude);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </div>

                  {/* Development Information */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4 mt-8">Development Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="developmentStatus"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Development Status <span className="text-destructive">*</span></FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? ""}
                            >
                              <FormControl className="w-full">
                                <SelectTrigger>
                                  <SelectValue placeholder="Select development status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(DevelopmentStatus).map(([key, value]) => (
                                  <SelectItem key={value} value={value as string}>
                                    {key.split('_').map(word =>
                                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                    ).join(' ')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rentalPotential"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rental Potential</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                            >
                              <FormControl className="w-full">
                                <SelectTrigger>
                                  <SelectValue placeholder="Select rental potential" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(RentalPotential).map(([key, value]) => (
                                  <SelectItem key={value} value={value as string}>
                                    {key}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="yearBuilt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year Built</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter year built"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="floorSqft"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Floor Area (sq. ft.)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Enter floor area"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="staffRatio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Staff to Residence Ratio</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Enter staff ratio"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="avgPricePerUnit"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Average Price per Unit</FormLabel>
                            <FormControl className="w-full">
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Enter average price per unit"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="avgPricePerSqft"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Average Price per sq. ft.</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Enter average price per sq. ft."
                                {...field}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Features Section */}
              <h2 className="text-xl font-semibold mb-4">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="keyFeatures"
                    render={() => (
                      <FormItem>
                        {isLoadingKeyFeatures ? (
                          <div className="text-sm text-muted-foreground">Loading key features...</div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4">
                            {keyFeatures.map((feature) => (
                              <FormField
                                key={feature.id}
                                control={form.control}
                                name="keyFeatures"
                                render={({ field }) => {
                                  const selectedFeatures = field.value || [];
                                  const isSelected = selectedFeatures.some(
                                    (f) => f.id === feature.id
                                  );

                                  return (
                                    <FormItem
                                      key={feature.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={isSelected}
                                          onCheckedChange={(checked) => {
                                            const newFeatures = checked
                                              ? [...selectedFeatures, feature]
                                              : selectedFeatures.filter(
                                                (f) => f.id !== feature.id
                                              );
                                            field.onChange(newFeatures);
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        {feature.name}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div className="flex flex-col gap-6 w-full">
                    <FormField
                      control={form.control}
                      name="petFriendly"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Pet Friendly?</FormLabel>
                            <FormDescription>
                              Is the residence pet friendly?
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="disabledFriendly"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Accessible for people with disabilities?</FormLabel>
                            <FormDescription>
                              Is the residence accessible for people with disabilities?
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Amenities Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 w-full">
                  <FormField
                    control={form.control}
                    name="amenities"
                    render={() => (
                      <FormItem>
                        {isLoadingAmenities ? (
                          <div className="text-sm text-muted-foreground">Loading amenities...</div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                            {amenities.map((amenity) => (
                              <FormField
                                key={amenity.id}
                                control={form.control}
                                name="amenities"
                                render={({ field }) => {
                                  const selectedAmenities = field.value || [];
                                  const isSelected = selectedAmenities.some(
                                    (a) => a.id === amenity.id
                                  );

                                  return (
                                    <FormItem
                                      key={amenity.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={isSelected}
                                          onCheckedChange={(checked) => {
                                            const newAmenities = checked
                                              ? [...selectedAmenities, amenity]
                                              : selectedAmenities.filter(
                                                (a) => a.id !== amenity.id
                                              );
                                            field.onChange(newAmenities);

                                            if (!checked) {
                                              const currentHighlighted = form.getValues("highlightedAmenities") || [];
                                              form.setValue(
                                                "highlightedAmenities",
                                                currentHighlighted.filter(highlighted => highlighted.id !== amenity.id)
                                              );
                                            }
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        {amenity.name}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Highlighted Amenities Section - Unapređeni UI */}
              <div className="space-y-8">
                <h2 className="text-lg font-semibold mb-4">Highlighted Amenities</h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="highlightedAmenities"
                    render={({ field }) => {
                      const selectedAmenities = form.watch("amenities") || [];
                      const highlightedAmenities: HighlightedAmenity[] = field.value || [];

                      const amenityOptions = selectedAmenities.map(amenity => ({
                        value: amenity.id,
                        label: amenity.name
                      }));

                      const selectedOptions = highlightedAmenities
                        .map(highlighted => {
                          const amenity = selectedAmenities.find(a => a.id === highlighted.id);
                          return amenity ? { value: amenity.id, label: amenity.name } : null;
                        })
                        .filter(Boolean) as { value: string; label: string }[];

                      const handleSelectionChange = (selected: { value: string; label: string }[]) => {
                        const newHighlightedAmenities = selected.map((item, index) => ({
                          id: item.value,
                          order: index
                        }));

                        field.onChange(newHighlightedAmenities);
                      };

                      return (
                        <FormItem>
                          <FormLabel>Featured amenities (max 3)</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={amenityOptions}
                              placeholder="Select amenities to highlight"
                              maxSelections={3}
                              value={selectedOptions}
                              onChange={handleSelectionChange}
                            />
                          </FormControl>
                          <FormDescription>
                            Select up to 3 amenities to highlight as featured. These will be displayed prominently.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-8">
                <h2 className="text-xl font-semibold mb-4">Gallery</h2>
                <div className="space-y-4">
                  <MultipleImageUpload
                    onChange={setImages}
                    onFeaturedChange={setFeaturedImage}
                    maxImages={10}
                    maxSizePerImage={2}
                    initialImages={images.filter((img): img is EditModeImage => 'mediaId' in img)}
                  />
                </div>

                <h2 className="text-xl font-semibold mb-4">Video Tour</h2>
                <FormField
                  control={form.control}
                  name="videoTourUrl"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Video Tour URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://youtube.com/..."
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormDescription>
                        URL to the video tour of the residence (YouTube, Vimeo, etc.)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>
      )}
      {/* Modals */}
      <DiscardModal
        isOpen={showDiscardModal}
        onClose={handleCancelDiscard}
        onConfirm={handleConfirmDiscard}
      />

      {/* Warning for unsaved changes */}
      <UnsavedChangesWarning hasUnsavedChanges={hasUnsavedChanges} />
    </>
  );
}