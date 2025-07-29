"use client";
import { Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { CountrySelect } from "../Forms/CountrySelect";
import { CitySelect } from "../Forms/CitySelect";
import { CardElement } from "@stripe/react-stripe-js";

type Residence = {
  id: string;
  name: string;
  address?: string;
  city?: { id: string; name: string };
  country?: { id: string; name: string };
};

type PremiumProduct = {
  id: string;
  name: string;
  description: string;
  featureKey: string;
  type: string;
  stripeProductId: string;
  stripePriceId: string;
  amount: string;
  currency: string;
  active: boolean;
  interval: string;
  isPremium: boolean;
};

type AccountForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  agree: boolean;
};

type Step2FormProps = {
  accountForm: AccountForm;
  setAccountForm: React.Dispatch<React.SetStateAction<AccountForm>>;
  selectedPropertyId: string;
  propertySearch: string;
  selectedPlanId: string;
  watch: (fieldName: string) => string;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  success: boolean;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
};

// Step 2 Form Component
function Step2Form({
  accountForm,
  setAccountForm,
  selectedPropertyId,
  propertySearch,
  selectedPlanId,
  watch,
  loading,
  setLoading,
  error,
  setError,
  success,
  setSuccess,
  setStep,
}: Step2FormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // 1. Create Stripe payment method
    if (!stripe || !elements) {
      setError("Stripe not loaded");
      setLoading(false);
      return;
    }
    const cardElement = elements.getElement(CardElement);
    const { error: stripeError, paymentMethod } =
      await stripe.createPaymentMethod({
        type: "card",
        card: cardElement!,
        billing_details: {
          name: accountForm.fullName,
          email: accountForm.email,
          phone: accountForm.phone,
        },
      });
    if (stripeError) {
      setError(stripeError.message || "Payment error");
      setLoading(false);
      return;
    }

    // 2. Prepare payload for premium profile request
    const payload = {
      propertyId: selectedPropertyId,
      propertyName: propertySearch,
      countryId: watch("countryId"),
      cityId: watch("cityId"),
      address: watch("address"),
      planId: selectedPlanId,
      fullName: accountForm.fullName,
      email: accountForm.email,
      phone: accountForm.phone,
      password: accountForm.password,
      stripePaymentMethodId: paymentMethod.id,
      agree: accountForm.agree,
    };
    // 3. Call API for premium profile request
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1";
      const response = await fetch(
        `${baseUrl}/api/${apiVersion}/public/billing/public/residence-subscription`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      
      const data = await response.json();
      console.log("API Response:", data);
      
      if (response.ok) {
        // Check if the operation was successful based on the response data
        if (data.success === true) {
          setStep(3);
          setSuccess(true);
        } else {
          // Handle case where user already has subscription
          setError(data.message || "Subscription already exists");
        }
      } else {
        throw new Error(data.message || "Submission failed");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Submission failed");
      } else {
        setError("Submission failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleStep2Submit}>
      <div>
        <label className="block text-xs font-semibold mb-1">Full Name *</label>
        <input
          type="text"
          value={accountForm.fullName}
          onChange={(e) =>
            setAccountForm((f) => ({ ...f, fullName: e.target.value }))
          }
          className="w-full border border-yellow-300 rounded px-4 py-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
          placeholder="Full Name *"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Password *</label>
        <input
          type="password"
          value={accountForm.password}
          onChange={(e) =>
            setAccountForm((f) => ({ ...f, password: e.target.value }))
          }
          className="w-full border border-yellow-300 rounded px-4 py-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
          placeholder="Password *"
          required
        />
        <div className="text-xs text-yellow-700 mt-1 flex items-center gap-2">
          <span>Medium password</span>
          <div className="flex-1 h-1 bg-yellow-200 rounded mx-2" />
          <div className="flex gap-1">
            <div className="w-8 h-1 bg-yellow-400 rounded" />
            <div className="w-8 h-1 bg-yellow-400 rounded" />
            <div className="w-8 h-1 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={accountForm.email}
            onChange={(e) =>
              setAccountForm((f) => ({ ...f, email: e.target.value }))
            }
            className="w-full border border-yellow-300 rounded px-4 py-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
            placeholder="Email Address *"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            value={accountForm.phone}
            onChange={(e) =>
              setAccountForm((f) => ({ ...f, phone: e.target.value }))
            }
            className="w-full border border-yellow-300 rounded px-4 py-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
            placeholder="Phone Number *"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">
          Card Details *
        </label>
        <div className="w-full border border-yellow-300 rounded px-4 py-3 bg-white text-gray-900 focus:outline-none">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#1a202c",
                  "::placeholder": { color: "#a0aec0" },
                  fontFamily: "inherit",
                },
                invalid: { color: "#e53e3e" },
              },
            }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          checked={accountForm.agree}
          onChange={(e) =>
            setAccountForm((f) => ({ ...f, agree: e.target.checked }))
          }
          className="form-checkbox h-5 w-5 text-yellow-600 rounded focus:ring-yellow-500 border-yellow-300"
          required
        />
        <span className="text-xs text-gray-700">
          I agree to the BBR{" "}
          <a href="#" className="text-yellow-700 underline">
            Terms of Service
          </a>
          ,{" "}
          <a href="#" className="text-yellow-700 underline">
            Privacy Policy
          </a>
        </span>
      </div>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      {success && (
        <div className="text-green-600 text-sm mt-2">
          Your premium profile request has been submitted successfully!
        </div>
      )}
      <div className="flex gap-4 mt-6">
        <button
          type="button"
          className="flex-1 border border-yellow-400 text-yellow-900 font-semibold py-3 rounded bg-white hover:bg-yellow-50 transition"
          onClick={() => setStep(1)}
          disabled={loading}
        >
          &larr; Previous
        </button>
        <button
          type="submit"
          className="flex-1 bg-[#0A2343] text-white py-3 rounded font-semibold hover:bg-[#14305b] transition"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </form>
  );
}

function HeroSection() {
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_12345"
  );
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      propertyName: "",
      countryId: "",
      cityId: "",
      state: "",
      zip: "",
      address: "",
      propertyId: "",
    },
  });
  const [step, setStep] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);
  const [propertySearch, setPropertySearch] = useState("");
  const [propertyResults, setPropertyResults] = useState<Residence[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [premiumProducts, setPremiumProducts] = useState<PremiumProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [accountForm, setAccountForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    agree: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Watch propertyName for search
  const watchedPropertyName = watch("propertyName");

  // Fetch premium products
  const fetchPremiumProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4002";
      const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1";
      const url = `${baseUrl}/api/${apiVersion}/public/billing/public/products?isPremium=true`;
      
      const response = await fetch(url, {
        headers: {
          'accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Premium products:", data);
        setPremiumProducts(data.data || data || []);
      } else {
        console.error("Failed to fetch premium products:", response.status);
        setPremiumProducts([]);
      }
    } catch (error) {
      console.error("Error fetching premium products:", error);
      setPremiumProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fetch premium products on component mount
  useEffect(() => {
    fetchPremiumProducts();
  }, []);

  // Auto-select plan if only one is available
  useEffect(() => {
    if (premiumProducts.length === 1 && !selectedPlanId) {
      setSelectedPlanId(premiumProducts[0].id);
    }
  }, [premiumProducts, selectedPlanId]);

  // Get selected plan details
  const selectedPlan = premiumProducts.find(p => p.id === selectedPlanId);

 

  // No need for handlePropertyInputChange, input will use field.onChange only

  // Debounced search effect
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!watchedPropertyName || watchedPropertyName.length < 2) {
      setPropertyResults([]);
      setPropertyDropdownOpen(false);
      return;
    }
    setPropertyDropdownOpen(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1";
        const url = new URL(`${baseUrl}/api/${apiVersion}/public/residences`);
        url.searchParams.set("query", watchedPropertyName);
        url.searchParams.set("limit", "8");
        const response = await fetch(url.toString());
        const data = await response.json();
        setPropertyResults(data.data || []);
      } catch {
        setPropertyResults([]);
      }
    }, 350);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [watchedPropertyName]);

  // Select property from dropdown
  const handlePropertySelect = (property: Residence) => {
    console.log("Selected Property:", property);
    
    // Set property name and ID
    setValue("propertyName", property.name);
    setPropertySearch(property.name);
    setSelectedPropertyId(property.id);
    setValue("propertyId", property.id);
    
    // Pre-fill country if available
    if (property.country && property.country.id) {
      console.log("Setting country:", property.country);
      setValue("countryId", property.country.id);
    } else {
      setValue("countryId", "");
    }
    
    // Pre-fill city if available (will be enabled once country is set)
    if (property.city && property.city.id) {
      console.log("Setting city:", property.city);
      // Use setTimeout to ensure country is set first
      setTimeout(() => {
        if (property.city && property.city.id) {
          setValue("cityId", property.city.id);
        }
      }, 100);
    } else {
      setValue("cityId", "");
    }
    
    // Pre-fill address if available
    if (property.address) {
      console.log("Setting address:", property.address);
      setValue("address", property.address);
    } else {
      setValue("address", "");
    }
    
    // Close dropdown and clear results
    setPropertyDropdownOpen(false);
    setPropertyResults([]);
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="relative h-[600px] w-full">
        {/* Background Image */}
        <Image
          src="/apply-for-ranking.png"
          alt="Hero Background"
          fill
          className="object-cover"
          priority
        />
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <p className="text-sm text-yellow-400 tracking-widest mb-2 uppercase">
          Request a Premium Profile
        </p>
        <h1 className="text-3xl md:text-5xl font-semibold text-white max-w-4xl leading-tight">
          Upgrade to a premium residence profile for maximum visibility among
          luxury buyers. Request your Premium Property Profile with Best Brand
          Residences today.
        </h1>
        
        <button
          className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-6 rounded-md transition-all"
          onClick={() => {
            setStep(1);
            setIsFormOpen(true);
          }}
        >
          Get Started
        </button>
      </div>

      {/* Step 1 Card */}
      {/* Step 1 Card */}
      {isFormOpen && step === 1 && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl flex w-full max-w-3xl min-h-[500px] overflow-hidden">
            {/* Left panel */}
            <div className="bg-[#F7F6F2] p-8 w-1/3 flex flex-col justify-between">
              <button
                className="text-yellow-700 text-sm mb-8 text-left"
                onClick={() => setStep(0)}
              >
                &lt; Return back
              </button>
              <div>
                <h2 className="text-2xl font-semibold mb-2">
                  Request Premium Residence Profile
                </h2>
                <p className="text-gray-600 text-base">
                  Elevate Your Property&apos;s Visibility and Gain Recognition Among Top Residences.
                </p>
              </div>
              
              {/* Premium Plans Summary */}
              {!isLoadingProducts && premiumProducts.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    YOUR SUMMARY
                  </h3>
                  {selectedPlanId && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Selected Plan:</p>
                      <p className="text-yellow-700 font-semibold">
                        {selectedPlan?.name}
                      </p>
                      {selectedPlan?.amount && (
                        <p className="text-yellow-600 font-bold text-sm mt-1">
                          ${parseFloat(selectedPlan.amount).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="space-y-3">
                    {premiumProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className={`bg-white rounded-lg p-4 shadow-sm cursor-pointer transition-all border-2 ${
                          selectedPlanId === product.id 
                            ? 'border-yellow-500 bg-yellow-50' 
                            : 'border-transparent hover:border-yellow-300'
                        }`}
                        onClick={() => setSelectedPlanId(product.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-800 font-medium">
                            {product.name}
                          </span>
                          <span className="text-yellow-600 font-bold text-lg">
                            ${parseFloat(product.amount).toLocaleString()}
                          </span>
                        </div>
                        {product.description && (
                          <p className="text-gray-600 text-sm mt-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isLoadingProducts && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    YOUR SUMMARY
                  </h3>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-gray-500">Loading plans...</div>
                  </div>
                </div>
              )}
            </div>
            {/* Right panel */}
            <div className="bg-white p-10 w-2/3 flex flex-col justify-center">
              <div className="mb-6">
                <div className="h-1 w-1/2 bg-yellow-500 rounded mb-6" />
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">
                  Tell us about your property
                </h3>
                <form
                  className="space-y-5"
                  onSubmit={handleSubmit(() => {
                    if (!selectedPlanId) {
                      alert("Please select a premium plan to continue.");
                      return;
                    }
                    setStep(2);
                  })}
                >
                  <div className="relative">
                    <Controller
                      name="propertyName"
                      control={control}
                      rules={{ required: "Property Name is required" }}
                      render={({ field }) => (
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Property Name *"
                            value={propertySearch}
                            onChange={(e) => {
                              field.onChange(e);
                              setPropertySearch(e.target.value);
                              // Clear selected property if user starts typing again
                              if (selectedPropertyId) {
                                setSelectedPropertyId("");
                                setValue("propertyId", "");
                                setValue("countryId", "");
                                setValue("cityId", "");
                                setValue("address", "");
                              }
                              setPropertyDropdownOpen(!!e.target.value);
                            }}
                            onFocus={() => {
                              if (propertySearch && !selectedPropertyId) {
                                setPropertyDropdownOpen(true);
                              }
                            }}
                            autoComplete="off"
                            className={`w-full border border-yellow-300 rounded px-4 py-3 focus:outline-none text-gray-900 placeholder-gray-500 ${errors.propertyName ? "border-red-500" : ""} ${selectedPropertyId ? "bg-green-50 border-green-300" : ""}`}
                          />
                          {selectedPropertyId && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPropertyId("");
                                setPropertySearch("");
                                setValue("propertyName", "");
                                setValue("propertyId", "");
                                setValue("countryId", "");
                                setValue("cityId", "");
                                setValue("address", "");
                              }}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              ✕
                            </button>
                          )}
                        </div>  
                      )}
                    />
                    {/* Dropdown for matched properties */}
                    {propertyDropdownOpen && propertyResults.length > 0 && (
                      <ul className="absolute left-0 right-0 top-full z-10 bg-white border border-yellow-300 rounded shadow-lg mt-1 max-h-56 overflow-auto">
                        {propertyResults.map((property) => (
                          <li
                            key={property.id}
                            className="px-4 py-2 cursor-pointer hover:bg-yellow-100 text-left"
                            onClick={() => handlePropertySelect(property)}
                          >
                            <span className="font-medium text-gray-900">
                              {property.name}
                            </span>
                            {property.city?.name && (
                              <span className="ml-2 text-xs text-gray-500">
                                {property.city.name}, {property.country?.name}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    {errors.propertyName && (
                      <span className="text-red-500 text-xs">
                        {errors.propertyName.message}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs uppercase text-yellow-900 font-semibold mb-1 tracking-wide">
                        Country *
                      </label>
                      <Controller
                        name="countryId"
                        control={control}
                        rules={{ required: "Country is required" }}
                        render={({ field }) => (
                          <CountrySelect
                            value={field.value}
                            onChange={(val) => {
                              field.onChange(val);
                              setValue("cityId", "");
                            }}
                            placeholder="Select country *"
                            className="w-full border border-yellow-300 rounded px-4 py-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
                          />
                        )}
                      />
                      {errors.countryId && (
                        <span className="text-red-500 text-xs">
                          {errors.countryId.message}
                        </span>
                      )}
                    </div>
                    {/* <div className="flex-1">
                        <label className="block text-xs uppercase text-yellow-900 font-semibold mb-1 tracking-wide">State *</label>
                        <input
                          type="text"
                          placeholder="State *"
                          {...register("state", { required: "State is required" })}
                          className={`w-full border border-yellow-300 rounded px-4 py-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none ${errors.state ? "border-red-500" : ""}`}
                        />
                        {errors.state && (
                          <span className="text-red-500 text-xs">{errors.state.message}</span>
                        )}
                      </div> */}
                  </div>
                  <div className="flex gap-4 mt-4">
                    <div className="flex-1">
                      <label className="block text-xs uppercase text-yellow-900 font-semibold mb-1 tracking-wide">
                        City *
                      </label>
                      <Controller
                        name="cityId"
                        control={control}
                        // rules={{ required: "City is required" }}
                        render={({ field }) => (
                          <CitySelect
                            countryId={watch("countryId")}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select city *"
                            disabled={!watch("countryId")}
                            className="w-full border border-yellow-300 rounded px-4 py-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
                          />
                        )}
                      />
                      {errors.cityId && (
                        <span className="text-red-500 text-xs">
                          {errors.cityId.message}
                        </span>
                      )}
                    </div>
                    {/* <div className="flex-1">
                        <label className="block text-xs uppercase text-yellow-900 font-semibold mb-1 tracking-wide">Zip code</label>
                        <input
                          type="text"
                          placeholder="Zip code"
                          {...register("zip")}
                          className="w-full border border-yellow-300 rounded px-4 py-3 bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
                        />
                      </div> */}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Complete address *"
                      {...register("address", {
                        required: "Address is required",
                      })}
                      className={`w-full border border-yellow-300 rounded px-4 py-3 focus:outline-none text-gray-900 placeholder-gray-500 ${errors.address ? "border-red-500" : ""}`}
                    />
                    {errors.address && (
                      <span className="text-red-500 text-xs">
                        {errors.address.message}
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#0A2343] text-white py-3 rounded font-semibold flex items-center justify-center gap-2 mt-4"
                  >
                    Next <span>&rarr;</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 Card - Payment Form */}
      {isFormOpen && step === 2 && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl flex w-full max-w-3xl min-h-[500px] overflow-hidden">
            {/* Left panel */}
            <div className="bg-[#F7F6F2] p-8 w-1/3 flex flex-col justify-between">
              <button
                className="text-yellow-700 text-sm mb-8 text-left"
                onClick={() => setStep(1)}
              >
                &lt; Return back
              </button>
              <div>
                <h2 className="text-2xl font-semibold mb-2">
                  Request Premium Residence Profile
                </h2>
                <p className="text-gray-600 text-base">
                  Elevate Your Property&apos;s Visibility and Gain Recognition Among Top Residences.
                </p>
              </div>
              
              {/* Premium Plans Summary */}
              {!isLoadingProducts && premiumProducts.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    YOUR SUMMARY
                  </h3>
                  {selectedPlanId && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Selected Plan:</p>
                      <p className="text-yellow-700 font-semibold">
                        {selectedPlan?.name}
                      </p>
                      {selectedPlan?.amount && (
                        <p className="text-yellow-600 font-bold text-sm mt-1">
                          ${parseFloat(selectedPlan.amount).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="space-y-3">
                    {premiumProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className={`bg-white rounded-lg p-4 shadow-sm cursor-pointer transition-all border-2 ${
                          selectedPlanId === product.id 
                            ? 'border-yellow-500 bg-yellow-50' 
                            : 'border-transparent hover:border-yellow-300'
                        }`}
                        onClick={() => setSelectedPlanId(product.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-800 font-medium">
                            {product.name}
                          </span>
                          <span className="text-yellow-600 font-bold text-lg">
                            ${parseFloat(product.amount).toLocaleString()}
                          </span>
                        </div>
                        {product.description && (
                          <p className="text-gray-600 text-sm mt-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isLoadingProducts && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    YOUR SUMMARY
                  </h3>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-gray-500">Loading plans...</div>
                  </div>
                </div>
              )}
            </div>
            {/* Right panel */}
            <div className="bg-white p-10 w-2/3 flex flex-col justify-center">
              <div className="mb-6">
                <div className="h-1 w-full bg-yellow-500 rounded mb-6" />
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">
                  Enter your personal and payment information
                </h3>
                <Step2Form 
                  accountForm={accountForm}
                  setAccountForm={setAccountForm}
                  selectedPropertyId={selectedPropertyId}
                  propertySearch={propertySearch}
                  selectedPlanId={selectedPlanId}
                  watch={watch}
                  loading={loading}
                  setLoading={setLoading}
                  error={error}
                  setError={setError}
                  success={success}
                  setSuccess={setSuccess}
                  setStep={setStep}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 Card - Thank You Message */}
      {isFormOpen && step === 3 && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl flex w-full max-w-3xl min-h-[500px] overflow-hidden">
            {/* Sidebar summary */}
            <div className="bg-[#F7F6F2] p-8 w-1/3 flex flex-col justify-between">
              <button
                className="text-yellow-700 text-sm mb-8 text-left"
                onClick={() => setStep(2)}
              >
                &lt; Previous
              </button>
              <div>
                <h2 className="text-2xl font-semibold mb-2">
                  Request Premium Residence Profile
                </h2>
                <p className="text-gray-600 text-base mb-8">
                  Elevate Your Property&apos;s Visibility and Gain Recognition Among Top Residences.
                </p>
              </div>
            </div>
            {/* Main form */}
            <div className="bg-white p-10 w-2/3 flex flex-col justify-center">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">
                  Thank you! Your premium profile request has been submitted successfully.
                </h3>
                <p className="text-gray-600 text-base mb-6">
                  We have received your request for a premium residence profile. Our team will review your application and contact you within 24-48 hours with next steps.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-green-800 font-medium">Application Submitted</p>
                      <p className="text-green-700 text-sm">You will receive a confirmation email shortly.</p>
                    </div>
                  </div>
                </div>
                <button
                  className="w-full bg-[#0A2343] text-white py-3 rounded font-semibold hover:bg-[#14305b] transition"
                  onClick={() => {
                    setIsFormOpen(false);
                    setStep(1);
                    // Reset form data
                    setAccountForm({
                      fullName: "",
                      email: "",
                      phone: "",
                      password: "",
                      agree: false,
                    });
                    setSelectedPropertyId("");
                    setPropertySearch("");
                    setSelectedPlanId("");
                    setError(null);
                    setSuccess(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Elements>
  );
}

export default HeroSection;
