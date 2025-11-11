'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from "react-select";
import countriesData from "./countries.json";
//import states from './states+cities.json'
import { z } from 'zod';
import { useRouter } from 'next/navigation';

// Form validation schema
const formSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  email: z.string().email('Invalid email address'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  businessType: z.string().min(1, 'Industry type is required'),
  gstin: z.string().min(1, 'GSTIN/UID is required'),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  state: z.string().min(1, 'State is required'),
  address: z.string().min(1, 'Address is required'),
  isGstRegistered: z.enum(['Yes', 'No']),
});

export default function AccountForm() {
  const [gstYes, setGstYes] = useState(false); //for GST field
  const [countries, setCountries] = useState([]); //for countries dropdown field
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    setCountries(
      countriesData.map((country) => ({
        value: country.name,
        label: country.name,
      }))
    );
  }, []);

  const handleChange = (selectedOption) => {
    setValue("country", selectedOption.value); // Set value for react-hook-form
  };

  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to register');
      }

      // Registration successful
      alert('Registration successful! Please login.');
      router.push('/login');
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const gstHandle = (event) => {
    setGstYes(event.target.value === "Yes"); //Set `gstYes` based on selection
  };

  return (
    <div className="max-w-2xl mt-20 mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">Create Your Account</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Information Section */}
        <section className="space-y-4">
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <div className=''>
              <div className='my-4'>
                <label htmlFor="businessName" className="block text-md font-medium text-black mb-1">
                  Business Name *
                </label>
                <input
                  id="businessName"
                  {...register('businessName')}
                  placeholder="Enter Your Business Name"
                  className="w-full px-4 py-2 border rounded-md text-black focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {errors.businessName && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
                )}
              </div>

              <div className='my-4'>
                <label htmlFor="email" className="block text-md font-medium text-black mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border rounded-md text-black focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className='my-4'>
                <label htmlFor="country" className="block text-md font-medium text-black mb-1">
                  Country *
                </label>
                <Select
                  options={countries}
                  onChange={handleChange}
                  placeholder="Select your country"
                  className="w-full text-black border rounded-md outline-none"
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                )}
              </div>


              <div className='my-4'>
                  <label htmlFor="city" className="block text-md font-medium text-black mb-1">
                    City *
                  </label>
                  <Select
                  options={countries}
                  onChange={handleChange}
                  placeholder="Select your country"
                  className="w-full text-black border rounded-md outline-none"
                />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                  )}
              </div>
            
              <div className='my-4'>
                <label htmlFor="businessType" className="block text-md font-medium text-black mb-1">
                  Business Type
                </label>
                <select
                  id="businessType"
                  {...register('businessType')}
                  className="w-full px-4 py-2 border rounded-md text-black focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Select Industry Type</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Service">Service</option>
                  <option value="Other">Other</option>
                </select>
                {errors.businessType && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessType.message}</p>
                )}
              </div>
            </div>
            
            <div className=''>
              <div className='my-4'>
                <label htmlFor="phone" className="block text-md font-medium text-black mb-1">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-2 border rounded-md text-black focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className='my-4'>
                <label htmlFor="password" className="block text-md font-medium text-black mb-1">
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="Create a password"
                  className="w-full px-4 py-2 border rounded-md text-black focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className='my-4'>
                <label htmlFor="state" className="block text-md font-medium text-black mb-1">
                  State *
                </label>
                <Select
                  options={countries}
                  onChange={handleChange}
                  placeholder="Select your country"
                  className="w-full text-black border rounded-md outline-none"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>

              <div className='my-4'>
                <label htmlFor="address" className="block text-md font-medium text-black mb-1">
                  Address *
                </label>
                <textarea
                  id="address"
                  {...register('address')}
                  placeholder="Enter your address"
                  rows={3}
                  className="w-full px-4 py-2 border rounded-md text-black focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div className='my-4'>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Is your business GST Registered? *
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="Yes"
                      {...register('isGstRegistered')}
                      onClick={gstHandle}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-black ml-2">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="No"
                      {...register('isGstRegistered')}
                      onClick={gstHandle}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-black ml-2">No</span>
                  </label>
                </div>
                {errors.isGstRegistered && (
                  <p className="mt-1 text-sm text-red-600">{errors.isGstRegistered.message}</p>
                )}
              </div>
            </div>
          </div>
          <div className={gstYes ? "block" : "hidden"}>
            <label htmlFor="gstin" className="block text-md font-medium text-black mb-1">
              Enter your GSTIN/UID *
            </label>
            <input
              id="gstin"
              {...register('gstin')}
              placeholder="Enter Your GSTIN/UID"
              className="w-full px-4 py-2 border rounded-md text-black focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {errors.gstin && (
              <p className="mt-1 text-sm text-red-600">{errors.gstin.message}</p>
            )}
          </div>
        </section>

        {/* Terms and Conditions */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              type="checkbox"
              {...register('terms')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-medium text-gray-700">
              I agree to the <a className='text-blue-500' href="">terms and conditions</a>
            </label>
            {errors.terms && (
              <p className="mt-1 text-red-600">{errors.terms.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Submit'}
        </button>

        {/* Sign In Link */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Log In
          </a>
        </p>
      </form>
    </div>
  );
}