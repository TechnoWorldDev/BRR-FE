"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { CountrySelect } from "@/components/web/Forms/CountrySelect";
import { CitySelect } from "@/components/web/Forms/CitySelect";
import { Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement } from "@stripe/react-stripe-js";
// Residence type for property search results
type Residence = {
  id: string;
  name: string;
  city?: { id: string; name: string };
  country?: { id: string; name: string };
};

// Move Step3Form and its props interface above HeroSection
interface Step3FormProps {
  accountForm: {
    fullName: string;
    password: string;
    email: string;
    phone: string;
    cardNumber: string;
    expiry: string;
    csv: string;
    agree: boolean;
  };
  setAccountForm: React.Dispatch<
    React.SetStateAction<{
      fullName: string;
      password: string;
      email: string;
      phone: string;
      cardNumber: string;
      expiry: string;
      csv: string;
      agree: boolean;
    }>
  >;
  selectedPropertyId: string;
  propertySearch: string;
  selectedCategories: string[];
  watch: (field: string) => unknown;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  success: boolean;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

function Step3Form({
  accountForm,
  setAccountForm,
  selectedPropertyId,
  propertySearch,
  selectedCategories,
  watch,
  loading,
  setLoading,
  error,
  setError,
  success,
  setSuccess,
  setStep,
}: Step3FormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handleStep3Submit = async (e: React.FormEvent) => {
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

    // 2. Prepare payload
    const payload = {
      propertyId: selectedPropertyId,
      propertyName: propertySearch,
      countryId: watch("countryId"),
      cityId: watch("cityId"),
      address: watch("address"),
      selectedCategoryIds: selectedCategories,
      fullName: accountForm.fullName,
      email: accountForm.email,
      phone: accountForm.phone,
      password: accountForm.password,
      stripePaymentMethodId: paymentMethod.id,
      agree: accountForm.agree,
    };

    // 3. Call API
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1";
      const response = await fetch(
        `${baseUrl}/api/${apiVersion}/public/apply-for-ranking`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Submission failed");
      }
      setStep(4);
      setSuccess(true);
      // Optionally, show a success message or redirect
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
    <form className="space-y-4" onSubmit={handleStep3Submit}>
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
          Your application has been submitted successfully!
        </div>
      )}
      <div className="flex gap-4 mt-6">
        <button
          type="button"
          className="flex-1 border border-yellow-400 text-yellow-900 font-semibold py-3 rounded bg-white hover:bg-yellow-50 transition"
          onClick={() => setStep(2)}
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

export default function HeroSection() {
  const [propertySearch, setPropertySearch] = useState("");
  const [propertyResults, setPropertyResults] = useState<Residence[]>([]);
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [step, setStep] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
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

  // Watch propertyName for search
  const watchedPropertyName = watch("propertyName");

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
    setValue("propertyName", property.name);
    setPropertySearch(property.name);
    setSelectedPropertyId(property.id);
    setValue("propertyId", property.id);
    // Set country and city if available, with extra null checks
    if (
      property &&
      property.country &&
      typeof property.country.id === "string"
    ) {
      setValue("countryId", property.country.id);
    } else {
      setValue("countryId", "");
    }
    if (property && property.city && typeof property.city.id === "string") {
      setValue("cityId", property.city.id);
    } else {
      setValue("cityId", "");
    }
    setPropertyDropdownOpen(false);
    setPropertyResults([]);
  };

  const [rankingCategories, setRankingCategories] = useState<
    {
      id: string;
      name: string;
      description?: string;
      featuredImage?: { id: string };
      rankingPrice?: string;
    }[]
  >([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankingError, setRankingError] = useState<string | null>(null);

  // Add state for selected categories and select all toggle
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Add state for step 3 form fields
  const [accountForm, setAccountForm] = useState({
    fullName: "",
    password: "",
    email: "",
    phone: "",
    cardNumber: "",
    expiry: "",
    csv: "",
    agree: false,
  });

  // In the Step 2 card, fetch categories when entering step 2
  useEffect(() => {
    if (step === 2) {
      const fetchCategories = async () => {
        setRankingLoading(true);
        setRankingError(null);
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
          const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v1";
          let rankingUrl = `${baseUrl}/api/${apiVersion}/public/ranking-categories/suggested?`;
          const params = [];
          if (watch("countryId"))
            params.push(`countryId=${watch("countryId")}`);
          if (watch("cityId")) params.push(`cityId=${watch("cityId")}`);
          if (watch("state")) params.push(`state=${watch("state")}`);
          rankingUrl += params.join("&");
          const response = await fetch(rankingUrl);
          const rankingData = await response.json();
          setRankingCategories(rankingData.data || []);
        } catch {
          setRankingError("Failed to fetch ranking categories");
        } finally {
          setRankingLoading(false);
        }
      };
      fetchCategories();
    }
    // eslint-disable-next-line
  }, [step]);

  // Custom Checkbox component
  function CustomCheckbox({
    checked,
    onChange,
    className = "",
  }: {
    checked: boolean;
    onChange: () => void;
    className?: string;
  }) {
    return (
      <button
        type="button"
        aria-checked={checked}
        onClick={onChange}
        className={`w-6 h-6 flex items-center justify-center border-2 rounded-md border-yellow-400 bg-white transition-colors duration-150 focus:outline-none ${checked ? "bg-yellow-400" : ""} ${className}`}
        tabIndex={0}
      >
        {checked && (
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>
    );
  }

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_12345"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="text-sm text-yellow-400 tracking-widest mb-2 uppercase">
            Apply for Ranking
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold text-white max-w-4xl leading-tight">
            Elevate Your Property’s Visibility and Gain Recognition Among Top
            Residences
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
                    Apply for Ranking
                  </h2>
                  <p className="text-gray-600 text-base">
                    Elevate Your Property’s Visibility and Gain Recognition
                    Among Top Residences.
                  </p>
                </div>
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
                    onSubmit={handleSubmit(() => setStep(2))}
                  >
                    <div className="relative">
                      <Controller
                        name="propertyName"
                        control={control}
                        rules={{ required: "Property Name is required" }}
                        render={({ field }) => (
                          <input
                            type="text"
                            placeholder="Property Name *"
                            value={propertySearch}
                            onChange={(e) => {
                              field.onChange(e);
                              setPropertySearch(e.target.value);
                              setPropertyDropdownOpen(
                                !!e.target.value && !selectedPropertyId
                              );
                            }}
                            onFocus={() => {
                              if (!selectedPropertyId && propertySearch) {
                                setPropertyDropdownOpen(true);
                              }
                            }}
                            autoComplete="off"
                            className={`w-full border border-yellow-300 rounded px-4 py-3 focus:outline-none text-gray-900 placeholder-gray-500 ${errors.propertyName ? "border-red-500" : ""}`}
                          />
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
        {/* Step 2 Card */}
        {isFormOpen && step === 2 && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl flex w-full max-w-3xl min-h-[500px] overflow-hidden">
              {/* Left panel */}
              <div className="bg-[#F7F6F2] p-8 w-1/3 flex flex-col justify-between">
                <button
                  className="text-yellow-700 text-sm mb-8 text-left"
                  onClick={() => setStep(1)}
                >
                  &lt; Previous
                </button>
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Apply for Ranking
                  </h2>
                  <p className="text-gray-600 text-base mb-8">
                    Elevate Your Property’s Visibility and Gain Recognition
                    Among Top Residences.
                  </p>
                  <div className="uppercase text-xs font-semibold text-gray-700 mb-2 tracking-widest">
                    Your Summary
                  </div>
                  <div className="border border-yellow-200 rounded-lg bg-white p-4 mb-2">
                    <ul className="mb-2">
                      {rankingCategories
                        .filter((cat) => selectedCategories.includes(cat.id))
                        .map((cat) => (
                          <li
                            key={cat.id}
                            className="flex justify-between items-center py-1 text-gray-900"
                          >
                            <span>{cat.name}</span>
                            <span className="font-medium">
                              {cat.rankingPrice
                                ? `$${cat.rankingPrice}/mo`
                                : "—"}
                            </span>
                          </li>
                        ))}
                    </ul>
                    <div className="flex justify-between items-center border-t border-yellow-100 pt-2 mt-2">
                      <span className="font-semibold text-gray-700">
                        Total:
                      </span>
                      <span className="text-2xl font-bold text-yellow-700">
                        $
                        {rankingCategories
                          .filter((cat) => selectedCategories.includes(cat.id))
                          .reduce(
                            (sum, cat) =>
                              sum + (parseFloat(cat.rankingPrice || "0") || 0),
                            0
                          )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right panel */}
              <div className="bg-white p-10 w-2/3 flex flex-col justify-center">
                <div className="mb-6">
                  <div className="h-1 w-1/2 bg-yellow-500 rounded mb-6" />
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">
                        Suggested Categories
                      </h3>
                      <div className="h-1 bg-yellow-500 rounded w-16 mt-2 mb-2" />
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                      <span className="text-gray-700 font-medium">
                        Select all
                      </span>
                      <CustomCheckbox
                        checked={selectAll}
                        onChange={() => {
                          if (!selectAll) {
                            setSelectedCategories(
                              rankingCategories.map((cat) => cat.id)
                            );
                          } else {
                            setSelectedCategories([]);
                          }
                          setSelectAll(!selectAll);
                        }}
                      />
                    </div>
                  </div>
                  {rankingLoading ? (
                    <div className="text-center text-gray-500">Loading...</div>
                  ) : rankingError ? (
                    <div className="text-center text-red-500">
                      {rankingError}
                    </div>
                  ) : rankingCategories.length === 0 ? (
                    <div className="text-center text-gray-500">
                      No categories found.
                    </div>
                  ) : (
                    <ul className="space-y-4 max-h-[350px] overflow-auto pr-2">
                      {rankingCategories.map((cat) => (
                        <li
                          key={cat.id}
                          className="flex items-center bg-white rounded-xl shadow-md border border-yellow-300 overflow-hidden hover:shadow-lg transition-shadow min-h-[110px] p-2"
                        >
                          <div className="w-28 h-20 flex-shrink-0 relative flex items-center justify-center">
                            {cat.featuredImage?.id ? (
                              <Image
                                src={`${process.env.NEXT_PUBLIC_API_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}/media/${cat.featuredImage.id}/content`}
                                alt={cat.name}
                                className="object-cover w-full h-full rounded-lg"
                                width={112}
                                height={80}
                              />
                            ) : (
                              <div className="bg-gray-200 w-full h-full rounded-lg" />
                            )}
                            <div className="absolute top-2 left-2 z-10">
                              <CustomCheckbox
                                checked={selectedCategories.includes(cat.id)}
                                onChange={() => {
                                  setSelectedCategories((prev) =>
                                    prev.includes(cat.id)
                                      ? prev.filter((id) => id !== cat.id)
                                      : [...prev, cat.id]
                                  );
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col justify-center px-4 py-2">
                            <div className="flex items-center justify-between">
                              <div className="font-semibold text-lg text-gray-900 line-clamp-1">
                                {cat.name}
                              </div>
                              <div className="text-yellow-700 font-bold text-lg whitespace-nowrap">
                                {cat.rankingPrice
                                  ? `$${cat.rankingPrice}/mo`
                                  : null}
                              </div>
                            </div>
                            <div className="text-gray-500 text-sm mt-1 line-clamp-2">
                              {cat.description || cat.name}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  className="w-full bg-[#0A2343] text-white py-3 rounded font-semibold flex items-center justify-center gap-2 mt-4"
                  onClick={() => setStep(3)}
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Step 3 Card */}
        {isFormOpen && step === 3 && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl flex w-full max-w-3xl min-h-[500px] overflow-hidden">
              {/* Sidebar summary (reuse from step 2) */}
              <div className="bg-[#F7F6F2] p-8 w-1/3 flex flex-col justify-between">
                <button
                  className="text-yellow-700 text-sm mb-8 text-left"
                  onClick={() => setStep(2)}
                >
                  &lt; Previous
                </button>
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Apply for Ranking
                  </h2>
                  <p className="text-gray-600 text-base mb-8">
                    Elevate Your Property’s Visibility and Gain Recognition
                    Among Top Residences.
                  </p>
                  <div className="uppercase text-xs font-semibold text-gray-700 mb-2 tracking-widest">
                    Your Summary
                  </div>
                  <div className="border border-yellow-200 rounded-lg bg-white p-4 mb-2">
                    <ul className="mb-2">
                      {rankingCategories
                        .filter((cat) => selectedCategories.includes(cat.id))
                        .map((cat) => (
                          <li
                            key={cat.id}
                            className="flex justify-between items-center py-1 text-gray-900"
                          >
                            <span>{cat.name}</span>
                            <span className="font-medium">
                              {cat.rankingPrice
                                ? `$${cat.rankingPrice}/mo`
                                : "—"}
                            </span>
                          </li>
                        ))}
                    </ul>
                    <div className="flex justify-between items-center border-t border-yellow-100 pt-2 mt-2">
                      <span className="font-semibold text-gray-700">
                        Total:
                      </span>
                      <span className="text-2xl font-bold text-yellow-700">
                        $
                        {rankingCategories
                          .filter((cat) => selectedCategories.includes(cat.id))
                          .reduce(
                            (sum, cat) =>
                              sum + (parseFloat(cat.rankingPrice || "0") || 0),
                            0
                          )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Main form */}
              <div className="bg-white p-10 w-2/3 flex flex-col justify-center">
                <div className="mb-6">
                  <div className="h-1 w-1/2 bg-yellow-500 rounded mb-6" />
                  <h3 className="text-2xl font-semibold mb-6 text-gray-900">
                    Set up your BBR account and payment details
                  </h3>
                  <Step3Form
                    accountForm={accountForm}
                    setAccountForm={setAccountForm}
                    selectedPropertyId={selectedPropertyId}
                    propertySearch={propertySearch}
                    selectedCategories={selectedCategories}
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

        {isFormOpen && step === 4 && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl flex w-full max-w-3xl min-h-[500px] overflow-hidden">
              {/* Sidebar summary (reuse from step 2) */}
              <div className="bg-[#F7F6F2] p-8 w-1/3 flex flex-col justify-between">
                <button
                  className="text-yellow-700 text-sm mb-8 text-left"
                  onClick={() => setStep(3)}
                >
                  &lt; Previous
                </button>
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Apply for Ranking
                  </h2>
                  <p className="text-gray-600 text-base mb-8">
                    Elevate Your Property’s Visibility and Gain Recognition
                    Among Top Residences.
                  </p>
                  {/* <div className="uppercase text-xs font-semibold text-gray-700 mb-2 tracking-widest">
                    Your Summary
                  </div>
                  <div className="border border-yellow-200 rounded-lg bg-white p-4 mb-2">
                    <ul className="mb-2">
                      {rankingCategories
                        .filter((cat) => selectedCategories.includes(cat.id))
                        .map((cat) => (
                          <li
                            key={cat.id}
                            className="flex justify-between items-center py-1 text-gray-900"
                          >
                            <span>{cat.name}</span>
                            <span className="font-medium">
                              {cat.rankingPrice
                                ? `$${cat.rankingPrice}/mo`
                                : "—"}
                            </span>
                          </li>
                        ))}
                    </ul>
                    <div className="flex justify-between items-center border-t border-yellow-100 pt-2 mt-2">
                      <span className="font-semibold text-gray-700">
                        Total:
                      </span>
                      <span className="text-2xl font-bold text-yellow-700">
                        $
                        {rankingCategories
                          .filter((cat) => selectedCategories.includes(cat.id))
                          .reduce(
                            (sum, cat) =>
                              sum + (parseFloat(cat.rankingPrice || "0") || 0),
                            0
                          )}
                      </span>
                    </div>
                  </div> */}
                </div>
              </div>
              {/* Main form */}
              <div className="bg-white p-10 w-2/3 flex flex-col justify-center">
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold mb-6 text-gray-900">
                    Thank you! Your application has been submitted successfully.
                  </h3>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Elements>
  );
}
