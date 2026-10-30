import { db, collection, getDocs, getDoc, doc, setDoc, deleteDoc, updateDoc, signIn, signOut, getSession, isAdmin, updateAdminLogin, uploadImage, deleteImage, importImage } from "../supabase-init.js";

        // Core DB variables
        let allProductsDb = {};
        let categoriesData = {};
        let siteSettings = {};
        let galleryData = {};
        let blogsData = {};
        let seoData = {};
        let tempUploadedImages = [];
        let tempInitialImages = [];
        let currentTab = 'dashboard';

        const defaultCategoriesData = {
            "Facade Lighting": ["Wall Washer", "Grazers", "Linear Lights", "Beam Lights"],
            "Landscape Lighting": ["Bollard", "Garden Spike", "Path Light", "Pool & Underwater"],
            "Indoor Architectural Lighting": ["COB Downlights", "Track Spotlight", "Suspended Linear"]
        };

        const defaultProductsData = {
            'facade-washer': {
                id: 'facade-washer', name: 'NX-80 Wall Washer', category: 'Facade Lighting', subcategory: 'Wall Washer', price: 'Premium Tier',
                heroImg: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?q=80&w=800&auto=format&fit=crop',
                signatureImg: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?q=80&w=800&auto=format&fit=crop',
                gallery: [
                    'https://images.unsplash.com/photo-1477348911244-63df70a259c2?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1555448232-421715053220?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1518241353330-0f797f26d2e6?q=80&w=800&auto=format&fit=crop'
                ],
                desc: 'Bathe entire structures in deep, volumetric light. Precision engineered for high-rise exterior illumination without light spill. Integrating thermal management technology that guarantees unparalleled longevity, the NX Series architectural wall washers transform passive facades into dynamic urban narratives.',
                features: ['High-output wide angle beam for massive coverage', 'DMX512 RGB+W color mixing with 16-bit resolution', 'Dark Sky compliant optical shield for environmental care', 'IP67 waterproof rating with gore-valve pressure relief', 'Anti-corrosion architectural coating for marine environments', '5-Year comprehensive specification-grade warranty'],
                specs: { Output: '5400 Lumens / 6800 Peak', Temp: 'RGB + 3000K / 4000K', Power: '80W LED Engine', Material: 'Extruded Aircraft Aluminum', Rating: 'IP67 / IK10 Impact', Lifespan: '75,000 Hours (L70)', Optics: '10° / 25° / 45° / Asym' },
                status: 'approved'
            },
            'facade-grazer': {
                id: 'facade-grazer', name: 'Linear Grazer G12', category: 'Facade Lighting', subcategory: 'Grazers', price: 'Architectural Grade',
                heroImg: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
                signatureImg: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
                gallery: [
                    'https://images.unsplash.com/photo-1477348911244-63df70a259c2?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1555448232-421715053220?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1506544755106-9ab8872b9a70?q=80&w=800&auto=format&fit=crop'
                ],
                desc: 'Extreme precision grazing for textured facades. Highlights material depth with razor-sharp optics. Designed specifically for accentuating masonry, stone, and architectural relief work without the unwanted spill or halo effect.',
                features: ['Asymmetric grazing lens with zero backward spill', 'Continuous run capable with plug-and-play connectors', 'IP67 rated for harsh outdoor environments', 'Marine grade powder coating as standard', 'Snap-on glare shields for absolute cut-off', 'DALI-2 / Casambi Dimming Compatible'],
                specs: { Output: '2000 Lm/m', Temp: '2200K - 5000K Tunable', Power: '24W/m - 36W/m', Dimensions: '30mm Slim Profile', Protocol: '0-10V / DALI / DMX', Efficiency: '110 Lm/W' },
                status: 'approved'
            },
            'facade-flex': {
                id: 'facade-flex', name: 'Neon-Flex Ultra', category: 'Facade Lighting', subcategory: 'Linear Lights', price: 'Specify per Meter',
                heroImg: 'https://images.unsplash.com/photo-1541882830027-897ab850550c?q=80&w=800&auto=format&fit=crop',
                signatureImg: 'https://images.unsplash.com/photo-1541882830027-897ab850550c?q=80&w=800&auto=format&fit=crop',
                gallery: [
                    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1505322022379-7d11fbc9c1df?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1518176505701-d0b8cc163155?q=80&w=800&auto=format&fit=crop'
                ],
                desc: 'Trace the geometry of your architecture. Seamless, flexible ribbons of light that contour to curves and hard edges perfectly. Cast entirely in optical-grade silicone to ensure zero dotting and 100% uniformity over massive continuous runs.',
                features: ['Dot-free continuous illumination over 10m', 'UV resistant silicone encapsulation (Non-yellowing)', 'Cuttable every 50mm for field adjustment', 'IP68 rating available for water features', 'IK08 Impact Resistance for high-traffic zones', 'Horizontal and Vertical bend radiuses'],
                specs: { Output: '800 Lm/meter', Temp: '2700K - 6500K', Power: '12W/meter', Profile: '16x16mm / 10x10mm', Bending: 'Top / Side / 3D Bend', Finish: 'Opal White' },
                status: 'approved'
            },
            'arch-cob': {
                id: 'arch-cob', name: 'Silent-COB Recessed', category: 'Indoor Architectural Lighting', subcategory: 'COB Downlights', price: 'Luxury Hospitality',
                heroImg: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
                signatureImg: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
                gallery: [
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800&auto=format&fit=crop'
                ],
                desc: 'The quietest ceiling you will ever see. Deep-recessed COB technology provides massive output with practically zero visible glare. Ideal for high-end residential and hospitality environments requiring absolute lighting control.',
                features: ['UGR < 13 rating for absolute visual comfort', 'High CRI > 97 for museum-quality color rendering', 'Interchangeable magnetic reflectors (Gold/Silver/Black)', 'Passive die-cast heat sink for zero-noise cooling', 'Flicker-free dimming down to 0.1%', 'Trimless mounting option for minimalist ceilings'],
                specs: { Output: '1000 - 3000 Lm', Temp: 'Dim-to-Warm (1800K-3000K)', Power: '10W-30W Engine', Beam: '15° / 24° / 36° / 50°', Cutout: '75mm - 120mm', Driver: 'Remote / Phase-Cut / DALI' },
                status: 'approved'
            },
            'facade-beam': {
                id: 'facade-beam', name: 'Column-Shot 3D', category: 'Facade Lighting', subcategory: 'Beam Lights', price: 'Bespoke Optics',
                heroImg: 'https://images.unsplash.com/photo-1501183307527-37fb62dccecb?q=80&w=800&auto=format&fit=crop',
                signatureImg: 'https://images.unsplash.com/photo-1501183307527-37fb62dccecb?q=80&w=800&auto=format&fit=crop',
                gallery: [
                    'https://images.unsplash.com/photo-1501183307527-37fb62dccecb?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1563089145559-0460f7dc68be?q=80&w=800&auto=format&fit=crop'
                ],
                desc: 'Pencil-thin shafts of light that shoot up structural columns or cross facades. High-contrast drama for modern buildings, creating distinct rhythmic patterns across massive surfaces.',
                features: ['Ultra-narrow 3° beam angle with precision TIR', 'Deep recessed LED source to eliminate side-glare', 'Modular snoot accessory for extreme cut-off', 'Vandal-resistant ik10 tempered glass', 'Internal hexagonal louvers for maximum comfort'],
                specs: { Output: '2000 Lumens', Temp: '4000K Cool / 3000K Warm', Power: '25W Precision LED', Beam: '3° Ultra-Narrow', IP: 'IP66 Rated', Driver: 'Integrated 240V' },
                status: 'approved'
            },
            'landscape-bollard': {
                id: 'landscape-bollard', name: 'Bollard Zero-Spill', category: 'Landscape Lighting', subcategory: 'Bollard', price: 'Project Spec',
                heroImg: 'https://images.unsplash.com/photo-1561571994-3c61c554181a?q=80&w=800&auto=format&fit=crop',
                signatureImg: 'https://images.unsplash.com/photo-1561571994-3c61c554181a?q=80&w=800&auto=format&fit=crop',
                gallery: [
                    'https://images.unsplash.com/photo-1561571994-3c61c554181a?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1501183307527-37fb62dccecb?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1563089145559-0460f7dc68be?q=80&w=800&auto=format&fit=crop'
                ],
                desc: 'Minimalist illumination for pathways and landscape perimeters. Directs light purely downward, preserving the night sky while providing safety and wayfinding for high-end hospitality projects.',
                features: ['Zero uplight emission (IDA Dark Sky Approved)', 'Heavy-duty cast base for high-traffic zones', 'Anti-tamper stainless steel hardware', 'Custom heights available from 300mm to 1200mm', 'Root mount or flange mount installation'],
                specs: { Output: '1200 Lumens', Temp: '2700K / 3000K', Power: '15W High-Eff LED', Height: '900mm Standard', Finish: 'Textured Anthracite / Bronze', CRI: '90+' },
                status: 'approved'
            }
        };

        const defaultSettings = {
            email: "info@nexalight.in",
            phone: "+91 81082 09914",
            whatsapp: "https://wa.me/918108209914",
            location: "Design Studio, Ganaur, Haryana, India",
            mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3485.498426038843!2d77.0142981!3d29.1203099!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390db17d2da53ea3%3A0x2a98f1f7bd84b2c1!2sGanaur%2C%20Haryana!5e0!3m2!1sen!2sin!4v1718453400000!5m2!1sen!2sin"
        };

        async function checkAuth() {
            try {
                if (await getSession() && await isAdmin()) {
                    document.getElementById('login-view').classList.add('hidden');
                    document.getElementById('admin-layout').classList.remove('hidden');
                    loadDatabase();
                    switchTab(currentTab);
                }
            } catch (err) { console.error(err); }
        }


        
window.handleLogin = async function(e) {
    e.preventDefault();
    const email = document.getElementById("admin-id").value.trim();
    const pass = document.getElementById("admin-pass").value;
    
    let ok = false;
    try {
        await signIn(email, pass);
        ok = await isAdmin();
        if (!ok) await signOut(); // valid Supabase user, but not in admin_users
    } catch(err) { console.error(err); }

    if (ok) {
        document.getElementById("login-error").classList.add("hidden");
        document.getElementById("login-view").classList.add("hidden");
        document.getElementById("admin-layout").classList.remove("hidden");
        loadDatabase();
        switchTab("dashboard");
        showToast("Authentication Successful");
    } else {
        const err = document.getElementById("login-error");
        err.classList.remove("hidden");
    }
};

        async function logout() {
            await signOut();
            location.reload();
        }

        
        window.loadDatabase = async function() {
            try {
                // Fetch Products
                const prodSnapshot = await getDocs(collection(db, "products"));
                allProductsDb = {};
                prodSnapshot.forEach(doc => { allProductsDb[doc.id] = doc.data(); });
                
                // Fetch Categories
                const catSnapshot = await getDocs(collection(db, "categories"));
                categoriesData = {};
                catSnapshot.forEach(doc => { categoriesData[doc.id] = doc.data().subcategories || []; });
                
                // Fetch Settings
                const setSnapshot = await getDocs(collection(db, "settings"));
                siteSettings = {};
                setSnapshot.forEach(doc => { siteSettings = doc.data(); });
                if(Object.keys(siteSettings).length === 0) siteSettings = defaultSettings;

                // Fetch Gallery
                const galSnapshot = await getDocs(collection(db, "gallery"));
                galleryData = {};
                galSnapshot.forEach(doc => { galleryData[doc.id] = doc.data(); });

                // Fetch Blogs
                const blogSnapshot = await getDocs(collection(db, "blogs"));
                blogsData = {};
                blogSnapshot.forEach(doc => { blogsData[doc.id] = doc.data(); });

                // Fetch SEO Settings
                const seoSnapshot = await getDocs(collection(db, "seo_settings"));
                seoData = {};
                seoSnapshot.forEach(doc => { seoData[doc.id] = doc.data(); });

                console.log("Database loaded from Supabase!");
                if(currentTab) switchTab(currentTab);
            } catch(e) {
                console.error("Error loading DB:", e);
                showToast("Failed to load database", "error");
            }
        };



        function showToast(msg, type = 'success') {
            const container = document.getElementById('toast-container');
            if (!container) return;
            const toast = document.createElement('div');
            toast.className = `toast-msg`;
            toast.innerHTML = `<span>${msg}</span>`;
            container.appendChild(toast);
            setTimeout(() => {
                toast.style.animation = 'toastFadeOut 0.4s forwards';
                setTimeout(() => toast.remove(), 400);
            }, 3000);
        }

        function switchTab(tabName) {
            currentTab = tabName;
            document.querySelectorAll('.admin-tab-btn').forEach(btn => {
                btn.classList.remove('active', 'bg-surfaceLight', 'text-primary', 'shadow-sm');
                btn.classList.add('text-secondary');
                if (btn.innerText.toLowerCase().includes(tabName.toLowerCase().substring(0, 4))) {
                    btn.classList.add('active', 'bg-surfaceLight', 'text-primary', 'shadow-sm');
                    btn.classList.remove('text-secondary');
                }
            });
            renderTabContent(tabName);
            toggleSidebar(false);
        }

        function renderTabContent(tabName) {
            const container = document.getElementById('admin-main-content');
            if (!container) return;

            const productsList = Object.values(allProductsDb);

            if (tabName === 'dashboard') {
                const totalProds = productsList.length;
                const activeProds = productsList.filter(p => p.status === 'approved').length;
                const draftProds = totalProds - activeProds;

                container.innerHTML = `
                    <div class="mb-10">
                        <h2 class="text-3xl font-medium tracking-tight text-primary">Dashboard Overview</h2>
                        <p class="text-secondary mt-2">Welcome back. Here is the current system status.</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div class="bg-white p-6 rounded-2xl shadow-sm border border-black/5 hover:shadow-md transition-shadow">
                            <div class="flex justify-between items-start mb-4">
                                <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">N</div>
                            </div>
                            <h3 class="text-3xl font-semibold text-primary mb-1">${totalProds}</h3>
                            <p class="text-xs uppercase tracking-widest text-secondary font-semibold">Total Instruments</p>
                        </div>
                        <div class="bg-white p-6 rounded-2xl shadow-sm border border-black/5 hover:shadow-md transition-shadow">
                            <div class="flex justify-between items-start mb-4">
                                <div class="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">L</div>
                            </div>
                            <h3 class="text-3xl font-semibold text-primary mb-1">${activeProds}</h3>
                            <p class="text-xs uppercase tracking-widest text-secondary font-semibold">Active & Live</p>
                        </div>
                        <div class="bg-white p-6 rounded-2xl shadow-sm border border-black/5 hover:shadow-md transition-shadow">
                            <div class="flex justify-between items-start mb-4">
                                <div class="w-10 h-10 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center">D</div>
                            </div>
                            <h3 class="text-3xl font-semibold text-primary mb-1">${draftProds}</h3>
                            <p class="text-xs uppercase tracking-widest text-secondary font-semibold">Drafts</p>
                        </div>
                    </div>
                `;
            }
            else if (tabName === 'products') {
                container.innerHTML = `
                    <div class="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
                        <div>
                            <h2 class="text-3xl font-medium tracking-tight">Product Database</h2>
                            <p class="text-secondary mt-1">Manage and update all lighting instruments.</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="relative">
                                <input type="text" placeholder="Search..." onkeyup="filterAdminTable(this.value)" class="pl-10 pr-4 py-2.5 bg-white border border-black/10 rounded-lg text-sm focus:outline-none focus:border-primary w-64 shadow-sm">
                            </div>
                            <button onclick="openProductModal()" class="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-black/80 transition-colors shadow-md flex items-center gap-2">
                                Add Product
                            </button>
                        </div>
                    </div>
                    <div class="bg-white border border-black/5 shadow-sm rounded-xl overflow-hidden overflow-x-auto admin-scroll">
                        <table class="w-full text-left border-collapse min-w-[800px]">
                            <thead class="bg-surfaceLight text-secondary sticky top-0 z-10 border-b border-black/5">
                                <tr>
                                    <th class="py-4 px-6 text-xs font-semibold uppercase tracking-widest">Instrument</th>
                                    <th class="py-4 px-6 text-xs font-semibold uppercase tracking-widest">Category Detail</th>
                                    <th class="py-4 px-6 text-xs font-semibold uppercase tracking-widest">Status</th>
                                    <th class="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${productsList.length === 0 ? `<tr><td colspan="4" class="py-12 text-center text-secondary">No products found. Add one to begin.</td></tr>` : ''}
                                ${productsList.map(p => `
                                <tr class="admin-table-row border-b border-black/5 hover:bg-black/[0.02] transition-colors">
                                    <td class="py-4 px-6">
                                        <div class="flex items-center gap-4">
                                            <div class="w-14 h-14 rounded-lg bg-surfaceLight overflow-hidden border border-black/5 shrink-0 relative">
                                                <img src="${p.heroImg || 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23ccc%22 stroke-width=%222%22><rect x=%223%22 y=%223%22 width=%2218%22 height=%2218%22 rx=%222%22 ry=%222%22/><circle cx=%228.5%22 cy=%228.5%22 r=%221.5%22/><polyline points=%2221 15 16 10 5 21%22/></svg>'}" class="w-full h-full object-cover">
                                            </div>
                                            <div>
                                                <div class="prod-name-cell font-medium text-primary text-base">${p.name}</div>
                                                <div class="prod-id-cell text-xs text-secondary mt-1 uppercase tracking-widest">ID: ${p.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="py-4 px-6">
                                        <span class="text-[10px] font-bold uppercase tracking-widest bg-surfaceLight text-primary px-2.5 py-1 rounded-full border border-black/5">${p.category}</span>
                                        <div class="text-xs text-secondary mt-1.5 font-medium">${p.subcategory || 'General'}</div>
                                    </td>
                                    <td class="py-4 px-6">
                                        <button onclick="toggleProductStatus('${p.id}')" class="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${p.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
                                            ${p.status === 'approved' ? 'Live' : 'Draft'}
                                        </button>
                                    </td>
                                    <td class="py-4 px-6 text-right">
                                        <div class="flex items-center justify-end gap-3">
                                            <button onclick="openProductModal('${p.id}')" class="text-secondary hover:text-primary p-2 rounded hover:bg-black/5 transition-colors">Edit</button>
                                            <button onclick="duplicateProduct('${p.id}')" class="text-secondary hover:text-primary p-2 rounded hover:bg-black/5 transition-colors">Duplicate</button>
                                            <button onclick="deleteProduct('${p.id}')" class="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors">Delete</button>
                                        </div>
                                    </td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
            else if (tabName === 'categories') {
                container.innerHTML = `
                    <div class="flex justify-between items-end mb-8">
                        <div>
                            <h2 class="text-3xl font-medium tracking-tight">Categories & Taxonomy</h2>
                            <p class="text-secondary mt-1">Structure product mapping and filter nodes.</p>
                        </div>
                        <button onclick="addCategory()" class="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-black/80 transition-colors shadow-md">Add Category</button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
                        ${Object.keys(categoriesData).map(cat => `
                            <div class="bg-white border border-black/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div class="flex justify-between items-start mb-4">
                                        <h3 class="font-semibold text-lg text-primary">${cat}</h3>
                                        <button onclick="deleteCategory('${cat}')" class="text-red-500 hover:text-red-700 text-xs font-medium hover:bg-red-50 px-2.5 py-1.5 rounded transition-colors">Delete</button>
                                    </div>
                                    <div class="space-y-2.5">
                                        <h4 class="text-[10px] font-bold uppercase tracking-widest text-secondary/60">Subcategories</h4>
                                        <div class="flex flex-wrap gap-2">
                                            ${categoriesData[cat].map(sub => `
                                                <span class="inline-flex items-center gap-1.5 bg-surfaceLight text-primary text-xs px-2.5 py-1 rounded-lg border border-black/5">
                                                    ${sub}
                                                    <button onclick="deleteSubcategory('${cat}', '${sub}')" class="text-secondary hover:text-red-500 font-bold ml-1">&times;</button>
                                                </span>
                                            `).join('')}
                                            ${categoriesData[cat].length === 0 ? '<span class="text-xs text-secondary italic">None. Add one below.</span>' : ''}
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-6 pt-4 border-t border-black/5 flex gap-2">
                                    <input type="text" placeholder="Add subcategory..." id="new-sub-${cat.replace(/\s/g, '')}" class="flex-1 bg-surfaceLight border border-black/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary">
                                    <button onclick="addSubcategory('${cat}', document.getElementById('new-sub-${cat.replace(/\s/g, '')}').value); document.getElementById('new-sub-${cat.replace(/\s/g, '')}').value='';" class="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-black/80">Add</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            else if (tabName === 'seo') {
                const defaultPages = ['home', 'products', 'gallery', 'about', 'contact'];
                const pagesToRender = new Set([...defaultPages, ...Object.keys(seoData)]);
                
                let seoHTML = `
                    <div class="mb-8">
                        <h2 class="text-3xl font-medium tracking-tight">SEO Management</h2>
                        <p class="text-secondary mt-1">Manage Meta Title and Description for all pages.</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                `;
                
                pagesToRender.forEach(page => {
                    const data = seoData[page] || { title: '', description: '' };
                    seoHTML += `
                        <div class="bg-white p-6 border border-black/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <h3 class="text-lg font-semibold capitalize mb-4 text-primary border-b border-black/5 pb-2">${page} Page</h3>
                            <form onsubmit="saveSEO(event, '${page}')" class="space-y-4">
                                <div>
                                    <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Meta Title</label>
                                    <input type="text" id="seo-title-${page}" value="${data.title || ''}" class="w-full bg-surfaceLight border border-black/10 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-accent transition-all text-sm" placeholder="Enter meta title...">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Meta Description</label>
                                    <textarea id="seo-desc-${page}" rows="3" class="w-full bg-surfaceLight border border-black/10 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-accent transition-all text-sm" placeholder="Enter meta description...">${data.description || ''}</textarea>
                                </div>
                                <button type="submit" class="w-full bg-primary text-white py-3 rounded-lg text-sm font-semibold hover:bg-black/80 transition-colors uppercase tracking-wider mt-2">Save ${page} SEO</button>
                            </form>
                        </div>
                    `;
                });
                
                seoHTML += `</div>`;
                container.innerHTML = seoHTML;
            }
            else if (tabName === 'settings') {
                container.innerHTML = `
                    <div class="mb-8">
                        <h2 class="text-3xl font-medium tracking-tight">System Settings</h2>
                        <p class="text-secondary mt-1">Global variables and contact points.</p>
                    </div>
                    <div class="bg-white border border-black/5 rounded-2xl shadow-sm max-w-2xl p-8 md:p-10">
                        <form onsubmit="saveSettings(event)" class="space-y-8">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Public Email</label>
                                    <input type="email" id="set-email" value="${siteSettings.email || ''}" class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Contact Phone</label>
                                    <input type="text" id="set-phone" value="${siteSettings.phone || ''}" class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors">
                                </div>
                                <div class="col-span-full">
                                    <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">WhatsApp Direct Link</label>
                                    <input type="text" id="set-wa" value="${siteSettings.whatsapp || ''}" class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors">
                                </div>
                                <div class="col-span-full">
                                    <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Office Location String</label>
                                    <input type="text" id="set-loc" value="${siteSettings.location || ''}" class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors">
                                </div>
                                <div class="col-span-full">
                                    <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Google Maps Embed Link (URL Only)</label>
                                    <input type="text" id="set-map" value="${siteSettings.mapEmbed || ''}" class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors">
                                </div>
                            </div>

                            <div class="mt-8 pt-8 border-t border-black/5">
                                <h3 class="text-xl font-medium tracking-tight mb-1">Admin Credentials</h3>
                                <p class="text-sm text-secondary mb-6">Change the email and/or password you sign in with. A new email must be confirmed from your inbox.</p>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">New Email</label>
                                        <input type="email" id="set-admin-id" placeholder="Leave blank to keep current" class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">New Password</label>
                                        <input type="password" id="set-admin-pass" placeholder="Leave blank to keep current" class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors">
                                    </div>
                                </div>
                            <div class="mt-8 pt-8 border-t border-black/5">
                                <h3 class="text-xl font-medium tracking-tight mb-1 text-red-600">Advanced Data Migration</h3>
                                <p class="text-sm text-secondary mb-6">Use this to automatically download all external Unsplash/dummy images to the Hostinger server and update the database.</p>
                                <button type="button" onclick="migrateAllImages()" id="btn-migrate" class="bg-red-50 text-red-600 border border-red-200 px-6 py-3 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors shadow-sm">Start Complete Migration</button>
                                <div id="migrate-status" class="text-xs text-secondary mt-2"></div>
                            </div>

                            <div class="pt-6 border-t border-black/5 mt-8">
                                <button type="submit" class="bg-primary text-white px-8 py-3.5 rounded-lg text-sm font-medium hover:bg-black/80 transition-colors shadow-lg">Save Configuration</button>
                            </div>
                        </form>
                    </div>
                `;
            }
        }

        function filterAdminTable(term) {
            term = term.toLowerCase();
            const rows = document.querySelectorAll('.admin-table-row');
            rows.forEach(row => {
                const name = row.querySelector('.prod-name-cell').innerText.toLowerCase();
                const id = row.querySelector('.prod-id-cell').innerText.toLowerCase();
                if (name.includes(term) || id.includes(term)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }

        window.toggleProductStatus = async function(id) {
            if (!allProductsDb[id]) return;
            const newStatus = allProductsDb[id].status === "approved" ? "draft" : "approved";
            try {
                await updateDoc(doc(db, "products", id), { status: newStatus });
                showToast("Status updated");
                loadDatabase();
            } catch(err) {
                console.error(err);
                showToast("Error updating status", "error");
            }
        };

        window.deleteProduct = async function(id) {
            if (confirm("Are you sure you want to delete this product?")) {
                try {
                    const docSnap = await getDoc(doc(db, "products", id));
                    let oldImages = [];
                    if (docSnap.exists()) {
                        const p = docSnap.data();
                        if (p.heroImg) oldImages.push(p.heroImg);
                        if (Array.isArray(p.gallery)) oldImages.push(...p.gallery);
                    }
                    
                    await deleteDoc(doc(db, "products", id));
                    showToast("Product deleted");
                    
                    oldImages.forEach(img => deleteImage(img).catch(e => console.error("Cleanup error:", e)));
                    
                    loadDatabase();
                } catch(err) {
                    console.error(err);
                    showToast("Error deleting", "error");
                }
            }
        };

        window.duplicateProduct = async function(id) {
            try {
                const docSnap = await getDoc(doc(db, "products", id));
                if (!docSnap.exists()) return;
                const original = docSnap.data();
                const newId = original.id + '-copy-' + Math.floor(Math.random() * 1000);
                const copy = JSON.parse(JSON.stringify(original));
                copy.id = newId;
                copy.name = copy.name + ' (Copy)';
                copy.status = 'draft';
                await setDoc(doc(db, "products", newId), copy);
                showToast("Product duplicated");
                loadDatabase();
            } catch(err) {
                console.error(err);
                showToast("Error duplicating", "error");
            }
        };

        window.addCategory = async function() {
            const cat = prompt("Enter new Category name (e.g. Architectural Facade)");
            if (cat && cat.trim()) {
                try {
                    await setDoc(doc(db, "categories", cat.trim()), { subcategories: [] });
                    showToast("Category added");
                    loadDatabase();
                } catch(err) { showToast("Error adding category", "error"); }
            }
        };

        window.deleteCategory = async function(cat) {
            if (confirm("Delete category " + cat + " and all its subcategories?")) {
                try {
                    await deleteDoc(doc(db, "categories", cat));
                    showToast("Category deleted");
                    loadDatabase();
                } catch(err) { showToast("Error deleting", "error"); }
            }
        };

        window.addSubcategory = async function(cat) {
            const sub = prompt("Enter new Subcategory for " + cat);
            if (sub && sub.trim()) {
                try {
                    let subs = categoriesData[cat] || [];
                    subs.push(sub.trim());
                    await setDoc(doc(db, "categories", cat), { subcategories: subs });
                    showToast("Subcategory added");
                    loadDatabase();
                } catch(err) { showToast("Error adding subcategory", "error"); }
            }
        };

        window.deleteSubcategory = async function(cat, sub) {
            try {
                if(!confirm(`Delete subcategory "${sub}" from ${cat}?`)) return;
                const updated = categoriesData[cat].filter(s => s !== sub);
                await updateDoc(doc(db, "categories", cat), { subcategories: updated });
                showToast("Subcategory deleted successfully");
                loadDatabase();
            } catch(e) { console.error(e); showToast("Failed to delete", "error"); }
        };

        // Modal Logic
        function openProductModal(id = null) {
            const modal = document.getElementById('admin-modal-container');
            let p = { id: '', name: '', category: Object.keys(categoriesData)[0] || '', subcategory: '', price: 'Specify', heroImg: '', gallery: [], desc: '', features: [], specs: {}, status: 'draft' };
            let isEdit = false;

            if (id && allProductsDb[id]) {
                p = JSON.parse(JSON.stringify(allProductsDb[id]));
                isEdit = true;
            }

            const catOptions = Object.keys(categoriesData).map(c => `<option value="${c}" ${c === p.category ? 'selected' : ''}>${c}</option>`).join('');
            const subcats = categoriesData[p.category] || [];
            const subcatOptions = subcats.map(s => `<option value="${s}" ${s === p.subcategory ? 'selected' : ''}>${s}</option>`).join('');

            const specsStr = Object.keys(p.specs || {}).map(k => `${k}:${p.specs[k]}`).join('\n');
            const featuresStr = (p.features || []).join('\n');

            const initialImages = [];
            if (p.heroImg) initialImages.push(p.heroImg);
            if (Array.isArray(p.gallery)) {
                p.gallery.forEach(img => {
                    if (img && !initialImages.includes(img)) initialImages.push(img);
                });
            }
            tempInitialImages = [...initialImages];
            tempUploadedImages = initialImages.length > 0 ? [...initialImages] : [""];

            modal.innerHTML = `
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] md:h-auto md:max-h-[90vh] flex flex-col overflow-hidden relative">
                    <div class="px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-b border-black/5 flex justify-between items-center bg-surfaceLight">
                        <h3 class="text-xl sm:text-2xl font-semibold tracking-tight text-primary">
                            ${isEdit ? 'Edit Instrument' : 'Create Instrument'}
                        </h3>
                        <button type="button" onclick="closeModal()" class="text-secondary hover:text-primary text-xl font-bold">&times;</button>
                    </div>
                    <div class="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 bg-white">
                        <form id="admin-product-form" class="space-y-6 sm:space-y-8" onsubmit="saveProduct(event, ${isEdit})">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                <div class="space-y-4 sm:space-y-6">
                                    <h4 class="font-semibold border-b border-black/5 pb-2 text-primary">Core Details</h4>
                                    <div>
                                        <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Product Name *</label>
                                        <input type="text" id="p-name" required value="${p.name}" onkeyup="if(!${isEdit}) document.getElementById('p-id').value = this.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')" class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">System ID (Slug) *</label>
                                        <input type="text" id="p-id" required value="${p.id}" ${isEdit ? 'readonly' : ''} class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors ${isEdit ? 'opacity-60 cursor-not-allowed bg-black/5' : ''}">
                                    </div>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Category</label>
                                            <select id="p-cat" onchange="updateSubcatDropdown(this.value)" class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                                                ${catOptions}
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Subcategory</label>
                                            <select id="p-subcat" class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                                                ${subcatOptions}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Price Label</label>
                                            <input type="text" id="p-price" value="${p.price}" class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Visibility</label>
                                            <select id="p-status" class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                                                <option value="draft" ${p.status === 'draft' ? 'selected' : ''}>Draft (Hidden)</option>
                                                <option value="approved" ${p.status === 'approved' ? 'selected' : ''}>Approved (Live)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-4 sm:space-y-6">
                                    <h4 class="font-semibold border-b border-black/5 pb-2 text-primary">Media & Gallery</h4>
                                    
                                    <!-- Web Preview Box -->
                                    <div class="border border-black/5 rounded-xl p-4 sm:p-6 bg-surfaceLight flex flex-col items-center justify-center relative overflow-hidden group">
                                        <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-4 w-full text-center">Web Preview (1:1 Aspect Ratio)</label>
                                        
                                        <!-- The exact mimic of the frontend product card -->
                                        <div class="relative aspect-square rounded-[1.5rem] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] w-48 sm:w-56 bg-[#e4e4e0] group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] transition-shadow duration-500">
                                            <img id="live-hero-preview" src="${initialImages[0] || 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23ccc%22 stroke-width=%222%22><rect x=%223%22 y=%223%22 width=%2218%22 height=%2218%22 rx=%222%22 ry=%222%22/></svg>'}" class="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105">
                                            <div class="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
                                            <div class="absolute top-4 left-4">
                                                <span id="live-cat-preview" class="bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full text-primary shadow-sm">${p.category || 'Category'}</span>
                                            </div>
                                        </div>
                                        <p class="text-[10px] text-secondary mt-4 text-center max-w-xs">Check if your product is centered correctly. Images are cropped to a perfect square on the website.</p>
                                    </div>

                                    <div class="border border-black/5 rounded-xl p-4 bg-surfaceLight/50">
                                        <div class="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                                            <label class="block text-xs font-semibold uppercase tracking-widest text-secondary">Images</label>
                                            <div class="flex gap-2">
                                                <input type="file" id="file-picker-input" multiple accept="image/*" class="hidden" onchange="handleFileSelect(event)">
                                                <button type="button" onclick="document.getElementById('file-picker-input').click()" class="bg-accent text-primary font-semibold py-1.5 px-3 rounded-lg text-xs hover:bg-opacity-90 transition-all">Upload Images</button>
                                                <button type="button" onclick="addNewImageField()" class="bg-primary text-white font-semibold py-1.5 px-3 rounded-lg text-xs">Add URL</button>
                                            </div>
                                        </div>
                                        <div id="p-images-container" class="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                                            <!-- Image rows generated dynamically -->
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Description</label>
                                        <textarea id="p-desc" rows="4" class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary resize-none transition-colors">${p.desc}</textarea>
                                    </div>
                                </div>
                                <div class="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-4 border-t border-black/5">
                                    <div>
                                        <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Features (1 per line)</label>
                                        <textarea id="p-features" rows="5" class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary resize-none transition-colors">${featuresStr}</textarea>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Technical Specs (Format -> Key:Value)</label>
                                        <textarea id="p-specs" rows="5" placeholder="Output:2000Lm\nPower:24W" class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary resize-none transition-colors font-mono">${specsStr}</textarea>
                                    </div>
                                </div>
                                <div class="col-span-full pt-4 border-t border-black/5">
                                    <h4 class="font-semibold pb-2 text-primary">SEO Settings (Optional)</h4>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-4">
                                        <div>
                                            <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Meta Title</label>
                                            <input type="text" id="p-seo-title" value="${p.seoTitle || ''}" class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors" placeholder="Leave blank to use product name">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Meta Description</label>
                                            <textarea id="p-seo-desc" rows="3" class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary resize-none transition-colors" placeholder="Leave blank to use product description">${p.seoDesc || ''}</textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="sticky bottom-0 -mx-4 sm:-mx-6 md:-mx-8 -mb-4 sm:-mb-6 md:-mb-8 px-4 sm:px-6 md:px-8 py-4 sm:py-5 bg-surfaceLight border-t border-black/5 flex justify-end gap-3 sm:gap-4 mt-8 z-10">
                                <button type="button" onclick="closeModal()" class="px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-semibold text-secondary bg-white border border-black/10">Cancel</button>
                                <button type="submit" class="bg-primary text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm font-semibold hover:bg-black/80 shadow-lg">Save Instrument</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            modal.classList.remove('hidden');
            updateMediaUI();
        }

        function closeModal() {
            document.getElementById('admin-modal-container').classList.add('hidden');
        }

        function updateSubcatDropdown(cat) {
            const subSelect = document.getElementById('p-subcat');
            if (!subSelect) return;
            const subs = categoriesData[cat] || [];
            subSelect.innerHTML = subs.map(s => `<option value="${s}">${s}</option>`).join('');
            
            const catPreview = document.getElementById('live-cat-preview');
            if (catPreview) catPreview.innerText = cat;
        }

        let cropper = null;
        let cropQueue = [];

        window.handleFileSelect = function(e) {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;
            
            cropQueue = cropQueue.concat(files);
            e.target.value = '';
            
            if (!cropper && cropQueue.length > 0) {
                processNextCrop();
            }
        }

        function processNextCrop() {
            if (cropQueue.length === 0) return;
            const file = cropQueue[0];
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.getElementById('cropper-image');
                img.src = e.target.result;
                document.getElementById('crop-modal').classList.remove('hidden');
                
                if (cropper) {
                    cropper.destroy();
                }
                
                cropper = new Cropper(img, {
                    aspectRatio: 1, // 1:1 Square
                    viewMode: 1,
                    dragMode: 'move',
                    autoCropArea: 1,
                    restore: false,
                    guides: true,
                    center: true,
                    highlight: false,
                    cropBoxMovable: true,
                    cropBoxResizable: true,
                    toggleDragModeOnDblclick: false,
                });
            };
            reader.readAsDataURL(file);
        }

        window.closeCropModal = function() {
            if (cropper) cropper.destroy();
            cropper = null;
            document.getElementById('crop-modal').classList.add('hidden');
            cropQueue.shift(); // Remove the current one and move on
            if (cropQueue.length > 0) {
                processNextCrop();
            }
        }

        window.confirmCrop = function() {
            if (!cropper) return;
            
            cropper.getCroppedCanvas({
                width: 1080,
                height: 1080,
                fillColor: '#fff',
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            }).toBlob((blob) => {
                if (!blob) return;
                const file = new File([blob], `cropped_${Date.now()}.jpg`, { type: "image/jpeg" });
                
                if (tempUploadedImages.length === 1 && tempUploadedImages[0] === "") {
                    tempUploadedImages[0] = file;
                } else {
                    tempUploadedImages.push(file);
                }
                updateMediaUI();
                
                closeCropModal();
            }, 'image/jpeg', 0.9);
        }

        function addNewImageField() {
            tempUploadedImages.push("");
            updateMediaUI();
        }

        function moveImage(index, direction) {
            if (!tempUploadedImages) return;
            const newIndex = index + direction;
            if (newIndex < 0 || newIndex >= tempUploadedImages.length) return;

            const temp = tempUploadedImages[index];
            tempUploadedImages[index] = tempUploadedImages[newIndex];
            tempUploadedImages[newIndex] = temp;

            updateMediaUI();
        }

        window.removeTempImage = async function(index) {
            tempUploadedImages.splice(index, 1);
            updateMediaUI();
        }

        function updateImageValue(index, value) {
            tempUploadedImages[index] = value;
            const preview = document.getElementById(`p-img-preview-${index}`);
            if (preview) {
                preview.src = value && value.trim() ? value : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
            }
            if (index === 0) {
                const liveHero = document.getElementById('live-hero-preview');
                if (liveHero) {
                    liveHero.src = value && value.trim() ? value : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>';
                }
            }
        }

        function updateMediaUI() {
            const container = document.getElementById('p-images-container');
            if (!container) return;
            const images = tempUploadedImages || [];
            if (images.length === 0) images.push("");

            const liveHero = document.getElementById('live-hero-preview');
            if (liveHero) {
                 const firstImg = images[0];
                 let previewSrc = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>';
                 if (firstImg instanceof File) previewSrc = URL.createObjectURL(firstImg);
                 else if (typeof firstImg === 'string' && firstImg.trim()) previewSrc = firstImg;
                 liveHero.src = previewSrc;
            }

            container.innerHTML = images.map((item, i) => {
                const isHero = i === 0;
                let previewSrc = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                let inputValue = '';
                let isReadOnly = false;
                
                if (item instanceof File) {
                    previewSrc = URL.createObjectURL(item);
                    inputValue = `[New File] ${item.name}`;
                    isReadOnly = true;
                } else if (typeof item === 'string') {
                    previewSrc = item && item.trim() ? item : previewSrc;
                    inputValue = item;
                }

                return `
                    <div class="flex items-center gap-3 bg-surfaceLight p-3 rounded-xl border border-black/5">
                        <div class="relative w-14 h-14 rounded-lg overflow-hidden border border-black/10 bg-white flex-shrink-0 flex items-center justify-center">
                            <img src="${previewSrc}" id="p-img-preview-${i}" class="w-full h-full object-cover">
                            ${isHero ? `<span class="absolute bottom-0 left-0 right-0 bg-primary text-white text-[9px] font-bold uppercase tracking-wider text-center py-0.5">Hero</span>` : ''}
                        </div>
                        <div class="flex-1 min-w-0">
                            <input type="text" placeholder="${isHero ? 'Enter hero image URL...' : 'Enter gallery image URL...'}" value="${inputValue}" oninput="if(!this.readOnly) updateImageValue(${i}, this.value)" ${isReadOnly ? 'readonly' : ''} class="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm focus:border-primary ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}">
                        </div>
                        <button type="button" onclick="removeTempImage(${i})" class="text-red-500 hover:text-red-700 font-bold px-2">&times;</button>
                    </div>
                `;
            }).join('');
        }



        // Toggle mobile sidebar
        function toggleSidebar(forceState = null) {
            const sidebar = document.getElementById('admin-sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            if (!sidebar || !overlay) return;
            
            const isOpen = !sidebar.classList.contains('-translate-x-full');
            const targetState = forceState !== null ? forceState : !isOpen;
            
            if (targetState) {
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.remove('opacity-0', 'pointer-events-none');
                overlay.classList.add('opacity-100', 'pointer-events-auto');
                document.body.style.overflow = 'hidden';
            } else {
                sidebar.classList.add('-translate-x-full');
                overlay.classList.remove('opacity-100', 'pointer-events-auto');
                overlay.classList.add('opacity-0', 'pointer-events-none');
                document.body.style.overflow = '';
            }
        }

        window.migrateAllImages = async function() {
            const btn = document.getElementById("btn-migrate");
            const status = document.getElementById("migrate-status");
            
            if (!confirm("This will scan all databases and copy external images into the site's image storage. Are you sure you want to start? Please do not close the browser.")) {
                return;
            }
            
            btn.disabled = true;
            btn.innerText = "Migration in progress...";
            
            let totalMigrated = 0;
            
            const isExternal = (url) => url && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('/storage/v1/object/public/media/');
            
            const migrateUrl = importImage;

            try {
                // Migrate Products
                status.innerText = "Scanning Products...";
                const productsSnap = await getDocs(collection(db, "products"));
                for (const pDoc of productsSnap.docs) {
                    let pData = pDoc.data();
                    let changed = false;
                    
                    if (isExternal(pData.heroImg)) {
                        pData.heroImg = await migrateUrl(pData.heroImg);
                        pData.signatureImg = pData.heroImg; // keep it in sync
                        changed = true;
                        totalMigrated++;
                        status.innerText = `Migrated Product Hero Image for ${pData.id}... (${totalMigrated} total)`;
                    }
                    
                    if (pData.gallery && Array.isArray(pData.gallery)) {
                        for (let i = 0; i < pData.gallery.length; i++) {
                            if (isExternal(pData.gallery[i])) {
                                pData.gallery[i] = await migrateUrl(pData.gallery[i]);
                                changed = true;
                                totalMigrated++;
                                status.innerText = `Migrated Product Gallery Image for ${pData.id}... (${totalMigrated} total)`;
                            }
                        }
                    }
                    
                    if (changed) {
                        await updateDoc(doc(db, "products", pDoc.id), {
                            heroImg: pData.heroImg,
                            signatureImg: pData.signatureImg,
                            gallery: pData.gallery
                        });
                    }
                }
                
                // Migrate Gallery
                status.innerText = "Scanning Gallery Projects...";
                const gallerySnap = await getDocs(collection(db, "gallery"));
                for (const gDoc of gallerySnap.docs) {
                    let gData = gDoc.data();
                    if (isExternal(gData.image)) {
                        gData.image = await migrateUrl(gData.image);
                        await updateDoc(doc(db, "gallery", gDoc.id), { image: gData.image });
                        totalMigrated++;
                        status.innerText = `Migrated Gallery Image for ${gData.id}... (${totalMigrated} total)`;
                    }
                }
                
                // Migrate Blogs
                status.innerText = "Scanning Blogs...";
                const blogsSnap = await getDocs(collection(db, "blogs"));
                for (const bDoc of blogsSnap.docs) {
                    let bData = bDoc.data();
                    let changed = false;
                    if (isExternal(bData.image)) {
                        bData.image = await migrateUrl(bData.image);
                        changed = true;
                    }
                    if (isExternal(bData.authorAvatar)) {
                        bData.authorAvatar = await migrateUrl(bData.authorAvatar);
                        changed = true;
                    }
                    
                    if (changed) {
                        await updateDoc(doc(db, "blogs", bDoc.id), { image: bData.image, authorAvatar: bData.authorAvatar });
                        totalMigrated++;
                        status.innerText = `Migrated Blog Images for ${bDoc.id}... (${totalMigrated} total)`;
                    }
                }
                
                status.innerText = `Migration Complete! Total images migrated: ${totalMigrated}. Please refresh the page.`;
                showToast("Migration completed successfully!", "success");
                
            } catch(err) {
                console.error("Migration error:", err);
                status.innerText = "Migration failed or encountered an error. Check console.";
                showToast("Migration failed", "error");
            } finally {
                btn.disabled = false;
                btn.innerText = "Start Complete Migration";
            }
        };

        // Run validation on load
        checkAuth();
    
// Window Exports for HTML onclick handlers
window.handleLogin = handleLogin;
window.logout = logout;
window.showToast = showToast;
window.switchTab = switchTab;
window.toggleSidebar = toggleSidebar;
window.filterAdminTable = filterAdminTable;
window.openProductModal = openProductModal;
window.closeModal = closeModal;
window.updateSubcatDropdown = updateSubcatDropdown;
window.addNewImageField = addNewImageField;
window.updateImageValue = updateImageValue;
window.moveImage = moveImage;
window.removeTempImage = removeTempImage;
window.closeCropModal = closeCropModal;
window.confirmCrop = confirmCrop;

// ==========================================
// 🔥 FIREBASE DB OVERRIDES
// ==========================================

window.saveProduct = async function(e, isEdit) {
    e.preventDefault();
    const id = document.getElementById("p-id").value.trim().toLowerCase().replace(/\s+/g, "-");
    if (!id) return;
    
    // Process form data
    const features = document.getElementById("p-features").value.split("\n").map(s => s.trim()).filter(Boolean);
    const specsLines = document.getElementById("p-specs").value.split("\n").map(s => s.trim()).filter(Boolean);
    const specs = {};
    specsLines.forEach(line => {
        const parts = line.split(":");
        if (parts.length >= 2) specs[parts[0].trim()] = parts.slice(1).join(":").trim();
    });

    const finalImages = [];
    showToast("Uploading new images...", "info");
    
    for (let i = 0; i < tempUploadedImages.length; i++) {
        let item = tempUploadedImages[i];
        if (item && typeof item === 'object') {
            try {
                finalImages.push(await uploadImage(item));
            } catch(err) {
                console.error(err);
                showToast("Image upload failed", "error");
                return; // Abort save on failure
            }
        } else if (typeof item === 'string' && item.trim()) {
            finalImages.push(item.trim());
        }
    }
    
    const heroImg = finalImages.length > 0 ? finalImages[0] : "";
    const gallery = finalImages.length > 1 ? finalImages.slice(1) : [];

    const data = {
        id: id,
        name: document.getElementById("p-name").value.trim(),
        category: document.getElementById("p-cat").value,
        subcategory: document.getElementById("p-subcat").value,
        price: document.getElementById("p-price").value.trim() || "Specify",
        status: document.getElementById("p-status").value,
        heroImg: heroImg,
        signatureImg: heroImg,
        gallery: gallery,
        desc: document.getElementById("p-desc").value.trim(),
        features: features,
        specs: specs,
        seoTitle: document.getElementById("p-seo-title").value.trim(),
        seoDesc: document.getElementById("p-seo-desc").value.trim()
    };

    try {
        await setDoc(doc(db, "products", id), data);
        showToast("Product saved successfully!");
        
        for (let oldImg of tempInitialImages) {
            if (oldImg && !finalImages.includes(oldImg)) {
                deleteImage(oldImg).catch(e => console.error("Cleanup error:", e));
            }
        }
        
        closeModal();
        loadDatabase(); // Reload UI
    } catch(err) {
        console.error(err);
        showToast("Error saving to database", "error");
    }
};



window.saveSEO = async function(e, page) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = 'Saving...';
    
    try {
        const title = document.getElementById(`seo-title-${page}`).value.trim();
        const desc = document.getElementById(`seo-desc-${page}`).value.trim();
        
        await setDoc(doc(db, "seo_settings", page), {
            title: title,
            description: desc,
            updatedAt: new Date().toISOString()
        });
        
        showToast(`SEO settings for ${page} saved successfully!`);
        loadDatabase();
    } catch (err) {
        console.error("Error saving SEO:", err);
        showToast("Failed to save SEO settings", "error");
    } finally {
        btn.innerText = originalText;
    }
};

window.saveSettings = async function(e) {
    e.preventDefault();
    const data = {
        email: document.getElementById("set-email").value.trim(),
        phone: document.getElementById("set-phone").value.trim(),
        whatsapp: document.getElementById("set-wa").value.trim(),
        location: document.getElementById("set-loc").value.trim(),
        mapEmbed: document.getElementById("set-map").value.trim()
    };
    try {
        await setDoc(doc(db, "settings", "config"), data);
        
        const newEmail = document.getElementById("set-admin-id")?.value.trim();
        const newPass = document.getElementById("set-admin-pass")?.value;
        if (newEmail || newPass) {
            await updateAdminLogin({ email: newEmail, password: newPass });
            showToast(newEmail ? "Admin login updated! Confirm the new email from your inbox." : "Admin password updated!", "success");
            document.getElementById("set-admin-id").value = "";
            document.getElementById("set-admin-pass").value = "";
        } else {
            showToast("Settings saved!");
        }
        
        loadDatabase();
    } catch(err) { showToast("Error saving settings", "error"); }
};



window.openGalleryModal = function(id = "") {
    const isEdit = !!id;
    const g = isEdit ? galleryData[id] : { id: "", title: "", desc: "", location: "", year: "", category: "Facade & Exterior", product: "", specs: "", image: "" };
    
    const container = document.getElementById("admin-main-content");
    container.innerHTML = `
        <div class="max-w-3xl mx-auto">
            <button type="button" onclick="switchTab('gallery')" class="text-secondary hover:text-primary mb-6 flex items-center gap-2 text-sm font-semibold transition-colors">← Back to Gallery</button>
            <div class="bg-white p-8 rounded-2xl shadow-sm border border-black/5">
                <h2 class="text-2xl font-medium tracking-tight mb-8">${isEdit ? "Edit Gallery Project" : "New Gallery Project"}</h2>
                <form onsubmit="saveGallery(event, ${isEdit})" class="space-y-6">
                    <div>
                        <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Project ID (Unique slug)</label>
                        <input type="text" id="g-id" value="${g.id}" ${isEdit ? "disabled" : ""} required class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Project Title</label>
                        <input type="text" id="g-title" value="${g.title}" required class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                    </div>
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Location</label>
                            <input type="text" id="g-location" value="${g.location}" required class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Year</label>
                            <input type="text" id="g-year" value="${g.year}" required class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Category</label>
                        <select id="g-cat" class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                            <option value="Facade & Exterior" ${g.category === "Facade & Exterior" ? "selected" : ""}>Facade & Exterior</option>
                            <option value="Landscape & Public Space" ${g.category === "Landscape & Public Space" ? "selected" : ""}>Landscape & Public Space</option>
                            <option value="Indoor Luxury" ${g.category === "Indoor Luxury" ? "selected" : ""}>Indoor Luxury</option>
                            <option value="Fiber Optic Immersive" ${g.category === "Fiber Optic Immersive" ? "selected" : ""}>Fiber Optic Immersive</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Main Image (Upload or Paste URL)</label>
                        <div class="flex gap-2">
                            <input type="text" id="g-image" value="${g.image}" required placeholder="/uploads/img.jpg" class="flex-1 bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                            <label class="cursor-pointer bg-primary text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-black/80 transition-colors flex items-center justify-center">
                                Upload File
                                <input type="file" class="hidden" accept="image/*" onchange="uploadImageToServer(this, 'g-image')">
                            </label>
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Description</label>
                        <textarea id="g-desc" rows="3" required class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">${g.desc}</textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Product Specified</label>
                            <input type="text" id="g-product" value="${g.product}" required class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Product Specs (Short)</label>
                            <input type="text" id="g-specs" value="${g.specs}" class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                        </div>
                    </div>
                    <div class="flex justify-end gap-3 pt-6 border-t border-black/5 mt-8">
                        <button type="button" onclick="switchTab('gallery')" class="px-6 py-3 rounded-lg text-sm font-semibold text-secondary bg-white border border-black/10 hover:bg-gray-50 transition-colors">Cancel</button>
                        <button type="submit" class="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-black/80 transition-colors">Save Project</button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

window.saveGallery = async function(e, isEdit) {
    e.preventDefault();
    const id = document.getElementById("g-id").value.trim().toLowerCase().replace(/\s+/g, "-");
    const data = {
        id: id,
        title: document.getElementById("g-title").value.trim(),
        location: document.getElementById("g-location").value.trim(),
        year: document.getElementById("g-year").value.trim(),
        category: document.getElementById("g-cat").value,
        image: document.getElementById("g-image").value.trim(),
        desc: document.getElementById("g-desc").value.trim(),
        product: document.getElementById("g-product").value.trim(),
        specs: document.getElementById("g-specs").value.trim()
    };
    try {
        await setDoc(doc(db, "gallery", id), data);
        showToast("Gallery Project saved!");
        loadDatabase();
    } catch(err) { showToast("Error saving", "error"); }
};

window.deleteGallery = async function(id) {
    if(confirm("Delete gallery project?")) {
        try {
            await deleteDoc(doc(db, "gallery", id));
            showToast("Project deleted");
            loadDatabase();
        } catch(err) { showToast("Error", "error"); }
    }
};

window.openBlogModal = function(id = "") {
    const isEdit = !!id;
    const b = isEdit ? blogsData[id] : { id: "", title: "", excerpt: "", content: "", author: "", authorAvatar: "", readTime: "", date: "", image: "", tags: [] };
    
    const container = document.getElementById("admin-main-content");
    container.innerHTML = `
        <div class="max-w-3xl mx-auto">
            <button type="button" onclick="switchTab('blogs')" class="text-secondary hover:text-primary mb-6 flex items-center gap-2 text-sm font-semibold transition-colors">← Back to Blogs</button>
            <div class="bg-white p-8 rounded-2xl shadow-sm border border-black/5">
                <h2 class="text-2xl font-medium tracking-tight mb-8">${isEdit ? "Edit Article" : "New Article"}</h2>
                <form onsubmit="saveBlog(event, ${isEdit})" class="space-y-6">
                    <div>
                        <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Article ID (Unique slug)</label>
                        <input type="text" id="b-id" value="${b.id}" ${isEdit ? "disabled" : ""} required class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Article Title</label>
                        <input type="text" id="b-title" value="${b.title}" required class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Main Image (Upload or Paste URL)</label>
                        <div class="flex gap-2">
                            <input type="text" id="b-image" value="${b.image}" required placeholder="/uploads/blog1.jpg" class="flex-1 bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                            <label class="cursor-pointer bg-primary text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-black/80 transition-colors flex items-center justify-center">
                                Upload File
                                <input type="file" class="hidden" accept="image/*" onchange="uploadImageToServer(this, 'b-image')">
                            </label>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Author Name</label>
                            <input type="text" id="b-author" value="${b.author}" required class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Author Avatar URL</label>
                            <input type="text" id="b-avatar" value="${b.authorAvatar}" required class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Publish Date</label>
                            <input type="text" id="b-date" value="${b.date}" placeholder="Oct 12, 2026" required class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Read Time</label>
                            <input type="text" id="b-read" value="${b.readTime}" placeholder="6 MIN READ" required class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Tags (Comma separated)</label>
                        <input type="text" id="b-tags" value="${(b.tags||[]).join(", ")}" required class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Excerpt (Short description)</label>
                        <textarea id="b-excerpt" rows="2" required class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">${b.excerpt}</textarea>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Full Content (HTML/Markdown support)</label>
                        <textarea id="b-content" rows="6" required class="w-full bg-surfaceLight border border-black/10 rounded-lg px-4 py-3 text-sm focus:border-primary transition-colors">${b.content}</textarea>
                    </div>
                    <div class="flex justify-end gap-3 pt-6 border-t border-black/5 mt-8">
                        <button type="button" onclick="switchTab('blogs')" class="px-6 py-3 rounded-lg text-sm font-semibold text-secondary bg-white border border-black/10 hover:bg-gray-50 transition-colors">Cancel</button>
                        <button type="submit" class="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-black/80 transition-colors">Save Article</button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

window.saveBlog = async function(e, isEdit) {
    e.preventDefault();
    const id = document.getElementById("b-id").value.trim().toLowerCase().replace(/\s+/g, "-");
    const data = {
        id: id,
        title: document.getElementById("b-title").value.trim(),
        image: document.getElementById("b-image").value.trim(),
        author: document.getElementById("b-author").value.trim(),
        authorAvatar: document.getElementById("b-avatar").value.trim(),
        date: document.getElementById("b-date").value.trim(),
        readTime: document.getElementById("b-read").value.trim(),
        tags: document.getElementById("b-tags").value.split(",").map(s => s.trim()).filter(Boolean),
        excerpt: document.getElementById("b-excerpt").value.trim(),
        content: document.getElementById("b-content").value.trim()
    };
    try {
        await setDoc(doc(db, "blogs", id), data);
        showToast("Blog Article saved!");
        loadDatabase();
    } catch(err) { showToast("Error saving", "error"); }
};

window.deleteBlog = async function(id) {
    if(confirm("Delete blog article?")) {
        try {
            await deleteDoc(doc(db, "blogs", id));
            showToast("Article deleted");
            loadDatabase();
        } catch(err) { showToast("Error", "error"); }
    }
};

window.openGalleryModal = openGalleryModal;
window.saveGallery = saveGallery;
window.deleteGallery = deleteGallery;
window.openBlogModal = openBlogModal;
window.saveBlog = saveBlog;
window.deleteBlog = deleteBlog;



window.uploadImageToServer = async function(inputElement, targetInputId) {
    const file = inputElement.files[0];
    if (!file) return;
    const targetInput = document.getElementById(targetInputId);
    const origVal = targetInput.value;
    targetInput.value = "Uploading...";
    try {
        targetInput.value = await uploadImage(file);
        targetInput.dispatchEvent(new Event("change"));
        showToast("Image uploaded successfully!");
    } catch (e) { console.error(e); targetInput.value = origVal; showToast("Upload failed", "error"); }
};
