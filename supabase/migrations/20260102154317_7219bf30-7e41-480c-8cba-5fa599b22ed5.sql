-- Update the 3 published blog posts to use clean HTML formatting (matches current renderer + editor)

UPDATE public.cms_blog_posts
SET
  excerpt = 'A practical deep-clean guide for Sydney homes: what to clean, when to do it, and a room-by-room checklist.',
  content = $$
<p>A deep clean is more than a quick tidy — it removes built-up dust, grease and allergens from the places regular cleaning often misses. If your home feels “clean” but still looks dull, smells stale, or triggers allergies, a deep clean is usually the fix.</p>

<h2>What is a deep clean?</h2>
<p>Deep cleaning goes beyond the usual weekly routine. It focuses on high-impact areas that collect grime over time — especially kitchens, bathrooms, high-touch surfaces, and “hidden” zones.</p>

<h2>What’s included in a professional deep clean</h2>
<ul>
  <li><strong>Behind & under furniture</strong> (where dust, crumbs and allergens build up)</li>
  <li><strong>Skirting boards, door frames & switches</strong> (often overlooked but very visible)</li>
  <li><strong>Kitchen grease removal</strong> around cooktops, splashbacks and cabinet fronts</li>
  <li><strong>Bathroom detailing</strong> including grout attention and sanitisation</li>
  <li><strong>Window tracks & sills</strong> for better airflow and a sharper finish</li>
</ul>

<h2>When should you schedule a deep clean?</h2>
<ol>
  <li><strong>Seasonally</strong> (4x a year is ideal for most households)</li>
  <li><strong>Before hosting</strong> (events, visitors, inspections)</li>
  <li><strong>After renovations</strong> (construction dust spreads everywhere)</li>
  <li><strong>Moving in or out</strong> (a reset for the next chapter)</li>
  <li><strong>After illness</strong> (a hygiene-focused reset)</li>
</ol>

<h2>Room-by-room deep cleaning checklist</h2>

<h3>Kitchen</h3>
<ul>
  <li>Degrease cooktop area and splashback</li>
  <li>Wipe cabinet fronts, handles and kickboards</li>
  <li>Clean sink, taps and drain area</li>
  <li>Wipe benches, table, chairs and high-touch points</li>
</ul>

<h3>Bathrooms</h3>
<ul>
  <li>Sanitise toilet, vanity, taps and shower surfaces</li>
  <li>Detail glass, mirrors and fixtures</li>
  <li>Remove soap scum build-up and polish finishes</li>
  <li>Spot-check grout lines and corners for grime</li>
</ul>

<h3>Living areas & bedrooms</h3>
<ul>
  <li>Dust skirting boards, frames and ledges</li>
  <li>Vacuum edges/corners and under accessible furniture</li>
  <li>Wipe switches, handles and other high-touch points</li>
</ul>

<h2>DIY vs professional deep cleaning</h2>
<p>DIY deep cleans work — but they’re time-heavy. Professional deep cleaning helps when you want a consistent, high-detail finish (and your weekend back). We bring trained staff, effective processes, and the right tools to get results efficiently.</p>

<h2>Ready for a deep clean in Sydney?</h2>
<p>Touch Cleaning services Sydney and surrounding areas. If you’d like a clear quote and a tailored checklist for your home, <a href="/contact">contact us</a> and we’ll organise the right clean for your space.</p>
$$,
  updated_at = now()
WHERE slug = 'ultimate-guide-deep-cleaning-home-2024';

UPDATE public.cms_blog_posts
SET
  excerpt = 'Why green cleaning matters: reduce irritants at home, improve indoor air quality, and protect the environment without sacrificing results.',
  content = $$
<p>More families are switching to eco-friendly cleaning because it’s safer for day-to-day living and reduces harsh chemical exposure indoors. The good news: “green” doesn’t mean “weak” — it means choosing products and methods that clean effectively with fewer irritants.</p>

<h2>The hidden downsides of conventional cleaners</h2>
<p>Many traditional products contain strong fragrances and chemicals that can linger on surfaces and in the air. Over time, that can contribute to:</p>
<ul>
  <li><strong>Respiratory irritation</strong> (especially for kids and people with asthma)</li>
  <li><strong>Skin sensitivity</strong> from residues on benches, floors and bathrooms</li>
  <li><strong>Indoor air pollution</strong> due to volatile compounds</li>
  <li><strong>Environmental impact</strong> as chemicals wash into waterways</li>
</ul>

<h2>Benefits of green cleaning (that you’ll actually notice)</h2>

<h3>1) Safer for children and pets</h3>
<p>Eco-friendly products are often plant-based and low-tox, which helps reduce exposure risks around floors, toys, and high-touch areas.</p>

<h3>2) Better indoor air quality</h3>
<p>Lower-fume products help your home feel fresher — especially in smaller spaces or during winter when windows stay closed.</p>

<h3>3) Gentler on surfaces</h3>
<p>Many green formulas are less abrasive, helping protect finishes on benches, tiles and fixtures.</p>

<h3>4) Reduced environmental footprint</h3>
<p>Biodegradable ingredients and more responsible packaging choices reduce long-term impact.</p>

<h2>What to look for when choosing eco-friendly products</h2>
<ul>
  <li>Trusted eco certifications (e.g. <strong>GECA</strong> where available)</li>
  <li>No heavy fragrance “perfume” blends if you’re scent-sensitive</li>
  <li>Clear ingredient lists (avoid vague “secret fragrance” mixes)</li>
  <li>Refillable or recyclable packaging</li>
</ul>

<h2>Our green cleaning approach</h2>
<p>At Touch Cleaning, we focus on effective methods first (microfibre technique, correct dwell time, proper rinsing where needed) and pair it with eco-friendly products that still deliver on results.</p>

<h2>Want a healthier clean?</h2>
<p>If you’re looking for a clean that feels fresh without harsh chemical smells, <a href="/contact">get in touch</a> and we’ll tailor a greener cleaning plan for your home.</p>
$$,
  updated_at = now()
WHERE slug = 'eco-friendly-cleaning-green-products-family';

UPDATE public.cms_blog_posts
SET
  excerpt = 'A clear guide to commercial cleaning expectations in Sydney: hygiene priorities, WHS considerations, and how to choose the right cleaning partner.',
  content = $$
<p>For Sydney businesses, commercial cleaning is about more than presentation. It supports workplace hygiene, helps reduce sick days, and contributes to a professional customer experience. The right cleaning plan also helps you meet day-to-day WHS expectations for a safe workplace.</p>

<h2>Why commercial cleaning standards matter</h2>

<h3>Employee wellbeing & fewer sick days</h3>
<p>High-touch points (kitchen benches, bathroom fixtures, door handles, shared desks) can spread germs quickly. A consistent cleaning plan reduces the overall load and helps keep teams healthier.</p>

<h3>Customer trust</h3>
<p>In retail, offices and public-facing sites, customers notice bathrooms, floors, glass and odour first. Clean spaces build confidence and strengthen your brand.</p>

<h2>Core focus areas for most workplaces</h2>
<ul>
  <li><strong>High-touch disinfection</strong> (handles, switches, shared surfaces)</li>
  <li><strong>Bathrooms</strong> (sanitisation + restocking/checks as required)</li>
  <li><strong>Kitchens & break rooms</strong> (hygiene, bins, benches, sinks)</li>
  <li><strong>Floors</strong> (vacuum/mop + periodic deep maintenance)</li>
  <li><strong>Waste removal</strong> and bin hygiene</li>
</ul>

<h2>Industry-specific expectations</h2>

<h3>Offices</h3>
<ul>
  <li>Meeting rooms and shared equipment wiped down</li>
  <li>Kitchens and bathrooms kept consistently hygienic</li>
  <li>Floor care matched to foot-traffic</li>
</ul>

<h3>Retail</h3>
<ul>
  <li>Entryways and floors kept safe (slip risk reduction)</li>
  <li>Fitting rooms, counters and displays kept presentable</li>
  <li>Back-of-house areas not overlooked</li>
</ul>

<h3>Medical / health settings</h3>
<ul>
  <li>Stricter disinfecting routines and documented processes</li>
  <li>Clear protocols for sensitive areas</li>
</ul>

<h2>How to choose a commercial cleaning partner</h2>
<ol>
  <li><strong>Consistency</strong> – clear scope, checklist-based cleaning, reliable scheduling</li>
  <li><strong>Quality control</strong> – routine checks and a feedback loop</li>
  <li><strong>Safety</strong> – WHS awareness, correct chemicals for surfaces, safe procedures</li>
  <li><strong>Flexibility</strong> – after-hours or low-disruption options</li>
  <li><strong>Communication</strong> – easy point of contact and quick issue resolution</li>
</ol>

<h2>Get a tailored commercial cleaning quote</h2>
<p>Touch Cleaning provides commercial cleaning across Sydney. If you want a cleaning plan that fits your site, schedule and budget, <a href="/contact">contact us</a> for a free quote.</p>
$$,
  updated_at = now()
WHERE slug = 'commercial-cleaning-standards-sydney-businesses';
