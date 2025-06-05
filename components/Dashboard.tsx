
import React, { useState } from 'react';
import { Language, PremiumFeature, Advertisement, SubscriptionPlan } from '../types';

interface DashboardProps {
  currentLanguage: Language;
  onExitDashboard: () => void;
}

const initialPremiumFeatures: PremiumFeature[] = [
  { id: 'pf1', name: 'Ad-Free Browsing', description: 'Enjoy Secnto without any advertisements.', isEnabled: true, language: Language.English },
  { id: 'pf2', name: 'Advanced AI Analysis', description: 'Unlock deeper insights with enhanced AI models.', isEnabled: false, language: Language.English },
  { id: 'pf3', name: 'Higher API Rate Limits', description: 'For power users and developers.', isEnabled: false, language: Language.English },
  { id: 'pf1u', name: 'اشتہارات کے بغیر براؤزنگ', description: 'بغیر کسی اشتہار کے سیکنٹو سے لطف اندوز ہوں۔', isEnabled: true, language: Language.Urdu },
  { id: 'pf2u', name: 'جدید اے آئی تجزیہ', description: 'بہتر اے آئی ماڈلز کے ساتھ گہری بصیرتیں کھولیں۔', isEnabled: false, language: Language.Urdu },
];

const initialAdvertisements: Advertisement[] = [
  { id: 'ad1', name: 'Local Restaurant Ad', content: 'Delicious Biryani at XYZ Restaurant - 20% Off!', displayLocation: 'search-top', isActive: true, language: Language.English },
  { id: 'ad2', name: 'Tech Gadget Ad', content: 'Latest Smartphone - Buy Now!', displayLocation: 'sidebar', isActive: false, language: Language.English },
  { id: 'ad1u', name: 'مقامی ریسٹورنٹ کا اشتہار', content: 'XYZ ریسٹورنٹ میں مزیدار بریانی - 20% چھوٹ!', displayLocation: 'search-top', isActive: true, language: Language.Urdu },
];

const initialSubscriptionPlans: SubscriptionPlan[] = [
  { id: 'plan1', name: 'Secnto Premium Monthly', price: 9.99, currency: 'USD', interval: 'month', features: ['Ad-Free Browsing', 'Basic AI Analysis'], language: Language.English },
  { id: 'plan2', name: 'Secnto Premium Yearly', price: 99.99, currency: 'USD', interval: 'year', features: ['Ad-Free Browsing', 'Advanced AI Analysis', 'Priority Support'], language: Language.English },
  { id: 'plan1u', name: 'سیکنٹو پریمیم ماہانہ', price: 1500, currency: 'PKR', interval: 'month', features: ['اشتہارات کے بغیر براؤزنگ', 'بنیادی اے آئی تجزیہ'], language: Language.Urdu },
];


const Dashboard: React.FC<DashboardProps> = ({ currentLanguage, onExitDashboard }) => {
  const [premiumFeatures, setPremiumFeatures] = useState<PremiumFeature[]>(initialPremiumFeatures);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(initialAdvertisements);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(initialSubscriptionPlans);

  const [newAd, setNewAd] = useState({ name: '', content: '', displayLocation: 'search-top' as Advertisement['displayLocation'], isActive: true });

  const handleAdInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setNewAd(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
        setNewAd(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddAdvertisement = (e: React.FormEvent) => {
    e.preventDefault();
    const adLanguage = currentLanguage; 
    setAdvertisements(prev => [
        ...prev, 
        { 
            id: `ad${Date.now()}${adLanguage === Language.Urdu ? 'u' : ''}`, 
            ...newAd, 
            language: adLanguage 
        }
    ]);
    setNewAd({ name: '', content: '', displayLocation: 'search-top', isActive: true }); 
  };
  
  const toggleAdActive = (id: string) => {
    setAdvertisements(prev => 
        prev.map(ad => ad.id === id ? { ...ad, isActive: !ad.isActive } : ad)
    );
  };
  
  const togglePremiumFeature = (id: string) => {
    setPremiumFeatures(prev =>
      prev.map(feature =>
        feature.id === id ? { ...feature, isEnabled: !feature.isEnabled } : feature
      )
    );
  };


  const S = {
    dashboardTitle: currentLanguage === Language.Urdu ? "CMS ڈیش بورڈ" : "CMS Dashboard",
    exitDashboard: currentLanguage === Language.Urdu ? "ڈیش بورڈ سے باہر نکلیں" : "Exit Dashboard",
    premiumFeaturesTitle: currentLanguage === Language.Urdu ? "پریمیم خصوصیات کا انتظام" : "Premium Feature Management",
    enableFeature: currentLanguage === Language.Urdu ? "خصوصیت فعال کریں" : "Enable Feature",
    disableFeature: currentLanguage === Language.Urdu ? "خصوصیت غیر فعال کریں" : "Disable Feature",
    adsManagementTitle: currentLanguage === Language.Urdu ? "اشتہارات کا انتظام" : "Advertisement Management",
    addNewAd: currentLanguage === Language.Urdu ? "نیا اشتہار شامل کریں" : "Add New Advertisement",
    adName: currentLanguage === Language.Urdu ? "اشتہار کا نام" : "Ad Name",
    adContent: currentLanguage === Language.Urdu ? "اشتہار کا مواد (متن/یو آر ایل)" : "Ad Content (Text/Image URL)",
    adDisplayLocation: currentLanguage === Language.Urdu ? "اشتہار کی جگہ" : "Ad Display Location",
    searchTop: currentLanguage === Language.Urdu ? "تلاش کے اوپر" : "Search Top",
    sidebar: currentLanguage === Language.Urdu ? "سائیڈبار" : "Sidebar",
    footer: currentLanguage === Language.Urdu ? "فوٹر" : "Footer",
    adActive: currentLanguage === Language.Urdu ? "فعال" : "Active",
    addAdButton: currentLanguage === Language.Urdu ? "اشتہار شامل کریں" : "Add Ad",
    currentAds: currentLanguage === Language.Urdu ? "موجودہ اشتہارات" : "Current Advertisements",
    activateAd: currentLanguage === Language.Urdu ? "فعال کریں" : "Activate",
    deactivateAd: currentLanguage === Language.Urdu ? "غیر فعال کریں" : "Deactivate",
    subscriptionManagementTitle: currentLanguage === Language.Urdu ? "سبسکرپشن اور اسٹرائپ مینجمنٹ" : "Subscription & Stripe Management",
    manageStripeSettings: currentLanguage === Language.Urdu ? "اسٹرائپ کی ترتیبات کا نظم کریں" : "Manage Stripe Settings",
    stripeDescription: currentLanguage === Language.Urdu ? "یہاں آپ پریمیم سبسکرپشنز کے لیے اسٹرائپ انٹیگریشن کو ترتیب اور منظم کریں گے۔" : "This is where you would configure and manage Stripe integration for premium subscriptions.",
    currentPlans: currentLanguage === Language.Urdu ? "موجودہ منصوبے" : "Current Subscription Plans",
    price: currentLanguage === Language.Urdu ? "قیمت" : "Price",
    interval: currentLanguage === Language.Urdu ? "وقفہ" : "Interval",
    features: currentLanguage === Language.Urdu ? "خصوصیات" : "Features",
    month: currentLanguage === Language.Urdu ? "ماہ" : "Month",
    year: currentLanguage === Language.Urdu ? "سال" : "Year",
  };
  
  const currentFeatures = premiumFeatures.filter(f => f.language === currentLanguage);
  const currentAds = advertisements.filter(ad => ad.language === currentLanguage);
  const currentPlans = subscriptionPlans.filter(p => p.language === currentLanguage);

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-secnto-gray-dark text-secnto-gray-text dark:text-secnto-gray-text-dark p-3 sm:p-6 md:p-8 ${currentLanguage === Language.Urdu ? 'urdu-text' : ''}`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secnto-green dark:text-secnto-green-dark mb-2 sm:mb-0">{S.dashboardTitle}</h1>
          <button
            onClick={onExitDashboard}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-secnto-blue text-white rounded-lg hover:bg-opacity-80 transition-colors self-start sm:self-center"
          >
            {S.exitDashboard}
          </button>
        </div>

        <section className="mb-8 sm:mb-10 p-4 sm:p-6 bg-white dark:bg-gray-600 rounded-xl shadow-lg">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200">{S.premiumFeaturesTitle}</h2>
          <div className="space-y-3 sm:space-y-4">
            {currentFeatures.map(feature => (
              <div key={feature.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-500 rounded-lg">
                <div className="mb-2 sm:mb-0 sm:mr-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">{feature.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
                <button
                  onClick={() => togglePremiumFeature(feature.id)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium w-full sm:w-auto
                    ${feature.isEnabled 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'}`}
                >
                  {feature.isEnabled ? S.disableFeature : S.enableFeature}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 sm:mb-10 p-4 sm:p-6 bg-white dark:bg-gray-600 rounded-xl shadow-lg">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200">{S.adsManagementTitle}</h2>
          <form onSubmit={handleAddAdvertisement} className="mb-6 sm:mb-8 p-3 sm:p-4 border border-gray-200 dark:border-gray-500 rounded-lg space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3 text-gray-900 dark:text-gray-100">{S.addNewAd}</h3>
            <div>
              <label htmlFor="adName" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{S.adName}</label>
              <input type="text" name="name" id="adName" value={newAd.name} onChange={handleAdInputChange} required 
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-secnto-blue focus:border-secnto-blue text-sm bg-white dark:bg-gray-500 text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label htmlFor="adContent" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{S.adContent}</label>
              <textarea name="content" id="adContent" value={newAd.content} onChange={handleAdInputChange} rows={3} required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-secnto-blue focus:border-secnto-blue text-sm bg-white dark:bg-gray-500 text-gray-900 dark:text-gray-100"></textarea>
            </div>
            <div>
              <label htmlFor="adDisplayLocation" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{S.adDisplayLocation}</label>
              <select name="displayLocation" id="adDisplayLocation" value={newAd.displayLocation} onChange={handleAdInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-secnto-blue focus:border-secnto-blue text-sm bg-white dark:bg-gray-500 text-gray-900 dark:text-gray-100">
                <option value="search-top">{S.searchTop}</option>
                <option value="sidebar">{S.sidebar}</option>
                <option value="footer">{S.footer}</option>
              </select>
            </div>
             <div className="flex items-center">
                <input type="checkbox" name="isActive" id="adIsActive" checked={newAd.isActive} onChange={handleAdInputChange}
                       className="h-4 w-4 text-secnto-blue border-gray-300 dark:border-gray-600 rounded focus:ring-secnto-blue dark:bg-gray-500 dark:focus:ring-offset-gray-600"/>
                <label htmlFor="adIsActive" className={`ml-2 block text-xs sm:text-sm text-gray-900 dark:text-gray-300 ${currentLanguage === Language.Urdu ? 'mr-2 ml-0' : ''}`}>{S.adActive}</label>
            </div>
            <button type="submit" className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-secnto-blue text-white rounded-lg hover:bg-opacity-80 transition-colors">{S.addAdButton}</button>
          </form>
          
          <h3 className="text-lg sm:text-xl font-medium mb-3 sm:mb-4 text-gray-800 dark:text-gray-200">{S.currentAds}</h3>
          <div className="space-y-2 sm:space-y-3">
            {currentAds.map(ad => (
              <div key={ad.id} className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-500 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-2 sm:mb-0 sm:mr-4">
                    <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">{ad.name} ({ad.displayLocation})</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs sm:max-w-md">{ad.content}</p>
                </div>
                 <button
                  onClick={() => toggleAdActive(ad.id)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium w-full sm:w-auto
                    ${ad.isActive 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'}`}
                >
                  {ad.isActive ? S.deactivateAd : S.activateAd}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="p-4 sm:p-6 bg-white dark:bg-gray-600 rounded-xl shadow-lg">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200">{S.subscriptionManagementTitle}</h2>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">{S.stripeDescription}</p>
          <button className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mb-4 sm:mb-6">
            {S.manageStripeSettings} (Stripe)
          </button>

          <h3 className="text-lg sm:text-xl font-medium mb-3 sm:mb-4 text-gray-800 dark:text-gray-200">{S.currentPlans}</h3>
           <div className="space-y-3 sm:space-y-4">
            {currentPlans.map(plan => (
              <div key={plan.id} className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-500 rounded-lg">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">{plan.name}</h4>
                <p className="text-sm sm:text-md text-secnto-green dark:text-secnto-green-dark">
                    {plan.currency === 'PKR' && currentLanguage === Language.Urdu ? 'Rs. ' : ''}
                    {plan.price.toLocaleString(currentLanguage === Language.Urdu ? 'ur-PK' : 'en-US')}
                    {plan.currency === 'USD' && currentLanguage === Language.English ? ' USD' : ''}
                    {' / '}
                    {plan.interval === 'month' ? S.month : S.year}
                </p>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1">{S.features}:</p>
                <ul className="list-disc list-inside text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-0.5 sm:space-y-1 mt-1">
                  {plan.features.map((feature, index) => <li key={index}>{feature}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
        
        <p className="mt-6 sm:mt-8 text-center text-[10px] sm:text-xs text-gray-500 dark:text-gray-600">
            {currentLanguage === Language.Urdu ? "یہ ایک نمائشی ڈیش بورڈ ہے۔ حقیقی دنیا کی فعالیت کے لیے بیک اینڈ انٹیگریشن اور مناسب توثیق درکار ہوگی۔" : "This is a demonstrative dashboard. Real-world functionality requires backend integration and proper authentication."}
        </p>

      </div>
    </div>
  );
};

export default Dashboard;
