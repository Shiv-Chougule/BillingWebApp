"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BarChart3, CheckCircle, FileText, Layers, Package, Smartphone, Truck, Users, Star, ScanEye} from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden mx-auto bg-gray-50">
      <main className="flex-1 justify-center mx-auto">
        {/* Hero Section */}
        <section className=" mx-auto w-full pt-24 py-12 lg:py-32 relative overflow-hidden bg-gray-50">
          <div className="absolute inset-0 pointer-events-none" />
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <motion.div 
                className="flex flex-col justify-center space-y-4"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="space-y-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="inline-block"
                  >
                    <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full font-medium">
                      🚀 Complete Business Solution
                    </span>
                  </motion.div>
                  <motion.h1 
                    className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                  >
                    Streamline Your Billing & Inventory Management
                  </motion.h1>
                  <motion.p 
                    className="max-w-[600px] text-muted-foreground md:text-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  >
                    Comprehensive solution for invoicing, purchase management, vendor tracking, inventory control, and automatic PDF/Excel generation - all in one powerful platform.
                  </motion.p>
                </div>
                <motion.div 
                  className="sm:mt-12 flex flex-col gap-4 sm:flex-row"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <Button size="lg" className="flex flex-row gap-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    <ArrowRight className="h-4 w-4 inline-block text-blue-600 mr-1" />
                    Start Free Trial 
                  </Button>
                  <Button size="lg" variant="outline" className="shadow-lg hover:shadow-xl transition-all duration-300">
                    <ScanEye className="h-4 w-4 inline-block text-blue-600 mr-1" />
                    Watch Demo
                  </Button>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-4 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.6 }}
                >
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span>14-day free trial</span>
                  </div>
                </motion.div>
              </motion.div>
              <motion.div 
                className="mx-auto lg:mx-0 relative"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                  <div className="relative group p-1">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10 scale-105" />
                    
                    <Image
                      src="https://images.unsplash.com/photo-1554224155-6726b3ff858f"
                      width={750}
                      height={550}
                      alt="Dashboard Preview"
                      className="relative rounded-lg border shadow-md group-hover:shadow-xl group-hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm bg-white"
                    />
                  </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-6 bg-gray-50">
          <div className="container px-4 md:px-6">
            <motion.div 
              className="flex flex-col items-center justify-center space-y-4 text-center"
              {...fadeInUp}
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Comprehensive Billing Features</h2>
                <p className="w-full text-muted-foreground md:text-xl/relaxed">
                  Everything you need to manage your business finances and inventory in one place
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12"
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.div variants={scaleIn}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>Invoice Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Create, customize, and send professional invoices. Track payments, send automated reminders, and generate PDF/Excel reports instantly.
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={scaleIn}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-green-200">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Truck className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle>Purchase Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Manage all your purchase orders and vendor invoices in one place. Track expenses, payments, and generate comprehensive purchase reports.
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={scaleIn}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Layers className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle>Proforma Invoices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Create detailed proforma invoices for quotes and estimates. Convert them to final invoices with one click and export as PDF or Excel.
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={scaleIn}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-200">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Package className="h-6 w-6 text-orange-600" />
                    </div>
                    <CardTitle>Smart Inventory Control</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Track vendor inventory, manage stock levels, get low-stock alerts, and automate purchase orders. Real-time inventory reports in PDF/Excel format.
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={scaleIn}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-pink-200">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <Users className="h-6 w-6 text-pink-600" />
                    </div>
                    <CardTitle>Customer & Vendor CRM</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Maintain detailed customer and vendor profiles, payment history, communication logs, and relationship management in one comprehensive system.
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={scaleIn}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-indigo-200">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-indigo-600" />
                    </div>
                    <CardTitle>Advanced Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Generate comprehensive financial reports, tax summaries, business analytics, and export everything to PDF or Excel with beautiful formatting.
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* PDF/Excel Generation Section */}
        <section className="w-full py-12 bg-gray-50">
          <div className="container px-4 md:px-6">
            <motion.div 
              className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              
              <motion.div 
                className="mx-auto lg:mx-0 relative"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                
                <div className="relative group p-1">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10 scale-105" />
                    
                    <Image
                      src="https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=750&h=550"
                      width={750}
                      height={550}
                      alt="Dashboard Preview"
                      className="relative rounded-lg border shadow-md group-hover:shadow-xl group-hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm bg-white"
                    />
                  </div>
              </motion.div>
              <motion.div 
                className="flex flex-col justify-center space-y-4"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Professional Document Generation</h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                    Generate beautiful, professional invoices, reports, and documents in PDF and Excel formats with just one click.
                  </p>
                </div>
                <ul className="grid gap-3">
                  <motion.li 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Instant PDF invoice generation with custom branding</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Excel reports for detailed financial analysis</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Batch export for multiple invoices and documents</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Automated email delivery of generated documents</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Customizable templates for all document types</span>
                  </motion.li>
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section id="dashboard" className="w-full py-12 bg-gray-50">
          <div className="container px-4 md:px-6">
            <motion.div 
              className="flex flex-col items-center justify-center space-y-4 text-center"
              {...fadeInUp}
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Powerful Dashboard</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Get a complete overview of your business with our intuitive dashboard
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="mx-auto mt-12 overflow-hidden rounded-xl border bg-background shadow-xl"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Image
                src="https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600"
                width={1200}
                height={600}
                alt="Dashboard Preview"
                className="w-full object-cover"
              />
            </motion.div>
            <motion.div 
              className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-12"
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.div variants={fadeInUp} className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Invoice Tracking</h3>
                <p className="text-muted-foreground">
                  Monitor all invoices, their status, and payment history at a glance.
                </p>
              </motion.div>
              <motion.div variants={fadeInUp} className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Inventory Alerts</h3>
                <p className="text-muted-foreground">Get notified when stock levels are low and automate reordering.</p>
              </motion.div>
              <motion.div variants={fadeInUp} className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Financial Insights</h3>
                <p className="text-muted-foreground">
                  View key financial metrics and business performance in real-time.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 bg-gray-50">
          <div className="container px-4 md:px-6">
            <motion.div 
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.div variants={scaleIn} className="flex flex-col items-center space-y-2 text-center">
                <motion.div 
                  className="text-3xl font-bold text-blue-600"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                >
                  10K+
                </motion.div>
                <p className="text-muted-foreground">Invoices Generated</p>
              </motion.div>
              <motion.div variants={scaleIn} className="flex flex-col items-center space-y-2 text-center">
                <motion.div 
                  className="text-3xl font-bold text-green-600"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.8, type: "spring" }}
                >
                  500+
                </motion.div>
                <p className="text-muted-foreground">Happy Customers</p>
              </motion.div>
              <motion.div variants={scaleIn} className="flex flex-col items-center space-y-2 text-center">
                <motion.div 
                  className="text-3xl font-bold text-purple-600"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7, duration: 0.8, type: "spring" }}
                >
                  99.9%
                </motion.div>
                <p className="text-muted-foreground">Uptime</p>
              </motion.div>
              <motion.div variants={scaleIn} className="flex flex-col items-center space-y-2 text-center">
                <motion.div 
                  className="text-3xl font-bold text-orange-600"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
                >
                  24/7
                </motion.div>
                <p className="text-muted-foreground">Support</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Mobile App Section */}
        <section id="mobile" className="w-full py-12 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <motion.div 
                className="flex flex-col justify-center space-y-4"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Manage On The Go</h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                    Our mobile app gives you the freedom to manage your business from anywhere, anytime.
                  </p>
                </div>
                <ul className="grid gap-3">
                  <motion.li 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Create and send invoices directly from your phone</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Scan receipts and track expenses on the go</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Check inventory levels and vendor stock in real-time</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Generate PDF invoices and Excel reports on mobile</span>
                  </motion.li>
                  <motion.li 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Access all your business data securely from anywhere</span>
                  </motion.li>
                </ul>
                <motion.div 
                  className="flex flex-col gap-2 min-[400px]:flex-row"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Smartphone className="h-4 w-4" /> Download App
                  </Button>
                </motion.div>
              </motion.div>
              <motion.div 
                className="mx-auto lg:mx-0 relative"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="relative group p-1">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10 scale-105" />
                    
                    <Image
                       src="https://images.pexels.com/photos/887751/pexels-photo-887751.jpeg?auto=compress&cs=tinysrgb&w=300&h=600"
                      width={750}
                      height={550}
                      alt="Dashboard Preview"
                      className="relative rounded-lg border shadow-md group-hover:shadow-xl group-hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm bg-white"
                    />
                  </div>
                
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-12">
          <div className="container px-4 md:px-6">
            <motion.div 
              className="flex flex-col items-center justify-center space-y-4 text-center"
              {...fadeInUp}
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Trusted by Businesses</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  See what our customers have to say about our billing and inventory management solution
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12"
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.div variants={scaleIn}>
                <Card className="bg-muted/50 h-full hover:shadow-lg transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-5 w-5 text-yellow-500 fill-current"
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground">
                        BillMaster has transformed how we manage our invoicing and inventory. The PDF generation feature has saved us countless hours and the vendor stock tracking is incredible.
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-muted p-1">
                          <Image
                            src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=40&h=40"
                            width={40}
                            height={40}
                            alt="Avatar"
                            className="rounded-full"
                          />
                        </div>
                        <div>
                          <p className="font-medium">Sarah Johnson</p>
                          <p className="text-sm text-muted-foreground">Retail Store Owner</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={scaleIn}>
                <Card className="bg-muted/50 h-full hover:shadow-lg transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-5 w-5 text-yellow-500 fill-current"
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground">
                        The mobile app is a game-changer. I can create proforma invoices while meeting clients and convert them to sales with PDF generation on the spot.
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-muted p-1">
                          <Image
                            src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=40&h=40"
                            width={40}
                            height={40}
                            alt="Avatar"
                            className="rounded-full"
                          />
                        </div>
                        <div>
                          <p className="font-medium">Michael Chen</p>
                          <p className="text-sm text-muted-foreground">Consulting Firm</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={scaleIn}>
                <Card className="bg-muted/50 h-full hover:shadow-lg transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-5 w-5 text-yellow-500 fill-current"
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground">
                        The Excel export feature for financial reports has given us insights we never had before. We have been able to cut costs and improve our cash flow significantly.
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-muted p-1">
                          <Image
                            src="https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=40&h=40"
                            width={40}
                            height={40}
                            alt="Avatar"
                            className="rounded-full"
                          />
                        </div>
                        <div>
                          <p className="font-medium">Emily Rodriguez</p>
                          <p className="text-sm text-muted-foreground">Manufacturing Business</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="container px-4 md:px-6">
            <motion.div 
              className="flex flex-col items-center justify-center space-y-4 text-center text-white"
              {...fadeInUp}
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Streamline Your Billing?</h2>
                <p className="max-w-[900px] text-blue-100 md:text-xl/relaxed">
                  Join thousands of businesses that trust BillMaster for their invoicing, inventory management, and document generation needs
                </p>
              </div>
              <motion.div 
                className="flex flex-col gap-2 min-[400px]:flex-row"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Button size="lg" className="gap-1 bg-white text-blue-600 hover:bg-gray-100">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Schedule Demo
                </Button>
              </motion.div>
              <p className="text-sm text-blue-100">No credit card required. 14-day free trial.</p>
            </motion.div>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="w-full mx-auto border-t bg-muted/40">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex items-center gap-2 font-bold">
            <FileText className="h-5 w-5" />
            <span>BillMaster</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} BillMaster. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Terms
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Privacy
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}