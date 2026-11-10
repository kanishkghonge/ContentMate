// Hardcoded insights bundled from the clinic growth map.
const DEFAULT_IDEAS = [
    {
        "title":  "Which conditions and procedures generate the most local demand?",
        "description":  null,
        "category":  "Market demand \u0026 local competition",
        "subcategory":  "Local demand and patient segments",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How does demand vary by age, income, locality and season?",
        "description":  null,
        "category":  "Market demand \u0026 local competition",
        "subcategory":  "Local demand and patient segments",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which patient needs are poorly served by nearby clinics?",
        "description":  null,
        "category":  "Market demand \u0026 local competition",
        "subcategory":  "Local demand and patient segments",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How much local demand can a small clinic realistically reach?",
        "description":  null,
        "category":  "Market demand \u0026 local competition",
        "subcategory":  "Local demand and patient segments",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How far will patients travel for routine care versus a procedure?",
        "description":  null,
        "category":  "Market demand \u0026 local competition",
        "subcategory":  "Local demand and patient segments",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Where do current patients live?",
        "description":  null,
        "category":  "Market demand \u0026 local competition",
        "subcategory":  "Catchment area",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which roads, parking constraints and landmarks affect access?",
        "description":  null,
        "category":  "Market demand \u0026 local competition",
        "subcategory":  "Catchment area",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which localities produce enquiries but few visits?",
        "description":  null,
        "category":  "Market demand \u0026 local competition",
        "subcategory":  "Catchment area",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "At what travel distance does conversion fall?",
        "description":  null,
        "category":  "Market demand \u0026 local competition",
        "subcategory":  "Catchment area",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which clinics compete for the same patients?",
        "description":  null,
        "category":  "Market demand \u0026 local competition",
        "subcategory":  "Competitor mapping and market gaps",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What do nearby competitors offer on access, fees, reputation and facilities?",
        "description":  null,
        "category":  "Market demand \u0026 local competition",
        "subcategory":  "Competitor mapping and market gaps",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which services are oversupplied or hard to access locally?",
        "description":  null,
        "category":  "Market demand \u0026 local competition",
        "subcategory":  "Competitor mapping and market gaps",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Where do patients go when this clinic cannot provide a service?",
        "description":  null,
        "category":  "Market demand \u0026 local competition",
        "subcategory":  "Competitor mapping and market gaps",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which services have seasonal peaks?",
        "description":  null,
        "category":  "Market demand \u0026 local competition",
        "subcategory":  "Seasonality",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How do festivals, weather, school calendars and pay cycles affect visits?",
        "description":  null,
        "category":  "Market demand \u0026 local competition",
        "subcategory":  "Seasonality",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which apparent growth trends are seasonal rather than durable?",
        "description":  null,
        "category":  "Market demand \u0026 local competition",
        "subcategory":  "Seasonality",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How do new patients discover the clinic?",
        "description":  null,
        "category":  "Visibility \u0026 patient discovery",
        "subcategory":  "Discovery channels",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which channels generate attended first visits, not just views or leads?",
        "description":  null,
        "category":  "Visibility \u0026 patient discovery",
        "subcategory":  "Discovery channels",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What share of new patients comes from Google, referrals, social media, signage and campaigns?",
        "description":  null,
        "category":  "Visibility \u0026 patient discovery",
        "subcategory":  "Discovery channels",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which discovery channels are underused for this specialty?",
        "description":  null,
        "category":  "Visibility \u0026 patient discovery",
        "subcategory":  "Discovery channels",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How many first-time patients can name the source that led them to the clinic?",
        "description":  null,
        "category":  "Visibility \u0026 patient discovery",
        "subcategory":  "Discovery channels",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which channels create demand that would not otherwise have arrived, rather than taking credit for existing word of mouth?",
        "description":  null,
        "category":  "Visibility \u0026 patient discovery",
        "subcategory":  "Discovery channels",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can people in target localities discover the clinic for relevant searches?",
        "description":  null,
        "category":  "Visibility \u0026 patient discovery",
        "subcategory":  "Geographic visibility",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is the clinic known only in its immediate neighbourhood?",
        "description":  null,
        "category":  "Visibility \u0026 patient discovery",
        "subcategory":  "Geographic visibility",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which areas generate awareness but few bookings?",
        "description":  null,
        "category":  "Visibility \u0026 patient discovery",
        "subcategory":  "Geographic visibility",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How does distance affect discovery-to-visit conversion?",
        "description":  null,
        "category":  "Visibility \u0026 patient discovery",
        "subcategory":  "Geographic visibility",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is this clinic one of the first names patients remember for the problem it treats?",
        "description":  null,
        "category":  "Visibility \u0026 patient discovery",
        "subcategory":  "Recall and word of mouth",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can patients explain what the doctor is known for?",
        "description":  null,
        "category":  "Visibility \u0026 patient discovery",
        "subcategory":  "Recall and word of mouth",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the clinic rely on the doctor personally asking for referrals?",
        "description":  null,
        "category":  "Visibility \u0026 patient discovery",
        "subcategory":  "Recall and word of mouth",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What do patients actually tell others about the clinic?",
        "description":  null,
        "category":  "Visibility \u0026 patient discovery",
        "subcategory":  "Recall and word of mouth",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can passers-by understand the clinic\u0027s specialty and entry point from its signage?",
        "description":  null,
        "category":  "Visibility \u0026 patient discovery",
        "subcategory":  "Offline discovery",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Do local camps create follow-up visits or only temporary footfall?",
        "description":  null,
        "category":  "Visibility \u0026 patient discovery",
        "subcategory":  "Offline discovery",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can offline enquiries be attributed to their source?",
        "description":  null,
        "category":  "Visibility \u0026 patient discovery",
        "subcategory":  "Offline discovery",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which patient problem should the clinic become known for solving?",
        "description":  null,
        "category":  "Positioning \u0026 service mix",
        "subcategory":  "Specialty focus and positioning",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is the clinic trying to attract too many unrelated patient types?",
        "description":  null,
        "category":  "Positioning \u0026 service mix",
        "subcategory":  "Specialty focus and positioning",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which services fit the doctor\u0027s competence, demand and facility?",
        "description":  null,
        "category":  "Positioning \u0026 service mix",
        "subcategory":  "Specialty focus and positioning",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which service should be the entry point to the clinic?",
        "description":  null,
        "category":  "Positioning \u0026 service mix",
        "subcategory":  "Specialty focus and positioning",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What does the clinic want to be the obvious local choice for?",
        "description":  null,
        "category":  "Positioning \u0026 service mix",
        "subcategory":  "Specialty focus and positioning",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can the clinic\u0027s positioning be understood by a patient without knowing medical terminology?",
        "description":  null,
        "category":  "Positioning \u0026 service mix",
        "subcategory":  "Specialty focus and positioning",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What can this clinic credibly offer that nearby alternatives do not?",
        "description":  null,
        "category":  "Positioning \u0026 service mix",
        "subcategory":  "Differentiation",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is the difference meaningful to patients or only to the doctor?",
        "description":  null,
        "category":  "Positioning \u0026 service mix",
        "subcategory":  "Differentiation",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can the difference be demonstrated through process, access or outcomes?",
        "description":  null,
        "category":  "Positioning \u0026 service mix",
        "subcategory":  "Differentiation",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Why would a patient choose this clinic when price and distance are similar?",
        "description":  null,
        "category":  "Positioning \u0026 service mix",
        "subcategory":  "Differentiation",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What evidence supports the doctor\u0027s public claims?",
        "description":  null,
        "category":  "Positioning \u0026 service mix",
        "subcategory":  "Doctor brand and credibility",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the public profile match the services actually delivered?",
        "description":  null,
        "category":  "Positioning \u0026 service mix",
        "subcategory":  "Doctor brand and credibility",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is the clinic brand too dependent on one doctor?",
        "description":  null,
        "category":  "Positioning \u0026 service mix",
        "subcategory":  "Doctor brand and credibility",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How can competence be communicated without exaggerated claims?",
        "description":  null,
        "category":  "Positioning \u0026 service mix",
        "subcategory":  "Doctor brand and credibility",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which services attract patients but contribute little profit?",
        "description":  null,
        "category":  "Positioning \u0026 service mix",
        "subcategory":  "Service portfolio decisions",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which services create operational strain?",
        "description":  null,
        "category":  "Positioning \u0026 service mix",
        "subcategory":  "Service portfolio decisions",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which services should be added, removed or referred out?",
        "description":  null,
        "category":  "Positioning \u0026 service mix",
        "subcategory":  "Service portfolio decisions",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are services added because of demand or because equipment is available?",
        "description":  null,
        "category":  "Positioning \u0026 service mix",
        "subcategory":  "Service portfolio decisions",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What does a patient need to know before choosing an unfamiliar doctor?",
        "description":  null,
        "category":  "Trust, reputation \u0026 patient choice",
        "subcategory":  "Pre-visit trust",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which unanswered questions stop patients booking?",
        "description":  null,
        "category":  "Trust, reputation \u0026 patient choice",
        "subcategory":  "Pre-visit trust",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are doctor details, fees, location, services and process visible?",
        "description":  null,
        "category":  "Trust, reputation \u0026 patient choice",
        "subcategory":  "Pre-visit trust",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Where is the clinic asking for trust without giving evidence?",
        "description":  null,
        "category":  "Trust, reputation \u0026 patient choice",
        "subcategory":  "Pre-visit trust",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How do review volume, recency and relevance compare with nearby clinics?",
        "description":  null,
        "category":  "Trust, reputation \u0026 patient choice",
        "subcategory":  "Reviews",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Do reviews reveal recurring issues with communication, waiting or staff?",
        "description":  null,
        "category":  "Trust, reputation \u0026 patient choice",
        "subcategory":  "Reviews",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are review requests consistent and ethical?",
        "description":  null,
        "category":  "Trust, reputation \u0026 patient choice",
        "subcategory":  "Reviews",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How should negative reviews be answered without disclosing patient information?",
        "description":  null,
        "category":  "Trust, reputation \u0026 patient choice",
        "subcategory":  "Reviews",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which proof is appropriate and compliant for this specialty?",
        "description":  null,
        "category":  "Trust, reputation \u0026 patient choice",
        "subcategory":  "Proof assets and trust signals",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can the clinic show its process and facilities without exposing patient privacy?",
        "description":  null,
        "category":  "Trust, reputation \u0026 patient choice",
        "subcategory":  "Proof assets and trust signals",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are testimonials or before-and-after claims permitted and contextualised?",
        "description":  null,
        "category":  "Trust, reputation \u0026 patient choice",
        "subcategory":  "Proof assets and trust signals",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are followers being mistaken for evidence of patient trust?",
        "description":  null,
        "category":  "Trust, reputation \u0026 patient choice",
        "subcategory":  "Proof assets and trust signals",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "At what point do interested patients lose confidence?",
        "description":  null,
        "category":  "Trust, reputation \u0026 patient choice",
        "subcategory":  "Where trust breaks",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Do unclear fees, inconsistent information or poor phone etiquette create suspicion?",
        "description":  null,
        "category":  "Trust, reputation \u0026 patient choice",
        "subcategory":  "Where trust breaks",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does online marketing create expectations the clinic cannot meet?",
        "description":  null,
        "category":  "Trust, reputation \u0026 patient choice",
        "subcategory":  "Where trust breaks",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which trust failures come from staff, doctor, environment or communication?",
        "description":  null,
        "category":  "Trust, reputation \u0026 patient choice",
        "subcategory":  "Where trust breaks",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is the profile claimed, accurate and complete?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Google Business Profile",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are specialty, services, hours, phone, address and booking links correct?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Google Business Profile",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Do photos help patients recognise the actual clinic entrance?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Google Business Profile",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Do profile views convert into calls, directions or bookings?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Google Business Profile",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can a new visitor understand specialty, location and next step in five seconds?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Instagram profile as a landing page",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the bio say who the clinic helps and how to book?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Instagram profile as a landing page",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are contact buttons, links, highlights and pinned posts useful?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Instagram profile as a landing page",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Do pinned posts answer the three questions a new visitor is likely to have: what you do, why trust you, and how to book?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Instagram profile as a landing page",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are highlights organised around patient decisions or around whatever the clinic happened to post?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Instagram profile as a landing page",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the profile make the clinic\u0027s location and booking route obvious without requiring a DM?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Instagram profile as a landing page",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can patients quickly find fees, location, doctor details and booking instructions?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Website and landing-page conversion",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does each key service have a useful patient-facing page?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Website and landing-page conversion",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the site work on low-end phones and slow connections?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Website and landing-page conversion",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How many steps does booking require?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Website and landing-page conversion",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which pages generate calls and appointments?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Website and landing-page conversion",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can patients book without calling during clinic hours?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Online booking and online OPD",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can patients see slots and receive confirmation?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Online booking and online OPD",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What happens after cancellations and no-shows?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Online booking and online OPD",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does online booking fit the clinic\u0027s real scheduling process?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Online booking and online OPD",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What information is needed before a visit, and what is unnecessary?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Online booking and online OPD",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Do topics answer questions patients in the clinic\u0027s catchment area ask?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Audience and content-market fit",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which topics attract potential patients rather than a broad irrelevant audience?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Audience and content-market fit",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does content match the clinic\u0027s services and capacity?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Audience and content-market fit",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is the audience geographically and demographically capable of becoming patients?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Audience and content-market fit",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are doctors creating content for peers when the commercial goal is local patient acquisition?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Audience and content-market fit",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which topics attract curiosity but have little connection to the clinic\u0027s services?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Audience and content-market fit",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can the same topic be reframed for awareness, trust and booking intent without repeating the same reel?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Audience and content-market fit",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which content supports awareness, trust, consideration and booking?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Content pillars and formats",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which topics deserve recurring series?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Content pillars and formats",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What belongs in reels, carousels, stories, lives and articles?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Content pillars and formats",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can the doctor explain clinical ideas in plain language without oversimplifying?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Content pillars and formats",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the opening identify a specific problem or reason to keep watching?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Hooks, scripting and retention",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Where does the script become predictable or too technical?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Hooks, scripting and retention",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does every line add a fact, example, consequence or decision?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Hooks, scripting and retention",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which editing choices mask dull moments without distorting medical meaning?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Hooks, scripting and retention",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the hook make a specific claim that the video actually supports?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Hooks, scripting and retention",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can a clinical topic be made interesting through a patient decision, common misunderstanding or practical consequence?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Hooks, scripting and retention",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which parts of a script need a visual example, on-screen text or cutaway to stay understandable?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Hooks, scripting and retention",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What action should a viewer take after each post?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Content-to-enquiry conversion",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can enquiries be traced to a post or campaign?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Content-to-enquiry conversion",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which posts generate profile visits, calls, bookings and attended visits?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Content-to-enquiry conversion",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How should reach be separated from audience quality and commercial outcomes?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Content-to-enquiry conversion",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How much doctor time does content consume?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Filming, editing and publishing workflow",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can filming be batched around clinic schedules?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Filming, editing and publishing workflow",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which tasks can be delegated while clinical claims remain doctor-approved?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Filming, editing and publishing workflow",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is the opportunity cost of the doctor\u0027s content time?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Filming, editing and publishing workflow",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What do patients search for when looking for this service locally?",
        "description":  null,
        "category":  "Google, local SEO \u0026 AI discovery",
        "subcategory":  "Search intent",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which searches signal urgent need, comparison or price checking?",
        "description":  null,
        "category":  "Google, local SEO \u0026 AI discovery",
        "subcategory":  "Search intent",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are pages written around patient questions or only keywords?",
        "description":  null,
        "category":  "Google, local SEO \u0026 AI discovery",
        "subcategory":  "Search intent",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How does the clinic rank for non-branded local searches?",
        "description":  null,
        "category":  "Google, local SEO \u0026 AI discovery",
        "subcategory":  "Search intent",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which queries generate clicks, calls and appointment requests?",
        "description":  null,
        "category":  "Google, local SEO \u0026 AI discovery",
        "subcategory":  "Search performance",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are important pages indexed and technically accessible?",
        "description":  null,
        "category":  "Google, local SEO \u0026 AI discovery",
        "subcategory":  "Search performance",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Do titles and descriptions accurately describe service and location?",
        "description":  null,
        "category":  "Google, local SEO \u0026 AI discovery",
        "subcategory":  "Search performance",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which pages attract traffic but fail to create patient action?",
        "description":  null,
        "category":  "Google, local SEO \u0026 AI discovery",
        "subcategory":  "Search performance",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can AI assistants identify the clinic\u0027s doctors, specialty, location and services accurately?",
        "description":  null,
        "category":  "Google, local SEO \u0026 AI discovery",
        "subcategory":  "AI search and answer engines",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which questions might AI answer before patients choose a clinic?",
        "description":  null,
        "category":  "Google, local SEO \u0026 AI discovery",
        "subcategory":  "AI search and answer engines",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How can the clinic monitor inaccurate AI descriptions?",
        "description":  null,
        "category":  "Google, local SEO \u0026 AI discovery",
        "subcategory":  "AI search and answer engines",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What public information would an AI system need to distinguish this clinic from another with a similar name?",
        "description":  null,
        "category":  "Google, local SEO \u0026 AI discovery",
        "subcategory":  "AI search and answer engines",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How should the clinic check whether AI tools are inventing services, timings or credentials?",
        "description":  null,
        "category":  "Google, local SEO \u0026 AI discovery",
        "subcategory":  "AI search and answer engines",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which healthcare directories actually send patients?",
        "description":  null,
        "category":  "Google, local SEO \u0026 AI discovery",
        "subcategory":  "Directories",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are paid listings incremental or charging for demand that already exists?",
        "description":  null,
        "category":  "Google, local SEO \u0026 AI discovery",
        "subcategory":  "Directories",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can directory leads be tracked?",
        "description":  null,
        "category":  "Google, local SEO \u0026 AI discovery",
        "subcategory":  "Directories",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is the maximum affordable cost per attended new patient?",
        "description":  null,
        "category":  "Paid marketing \u0026 campaign economics",
        "subcategory":  "CAC, lead economics and payback",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is contribution margin per new patient by service?",
        "description":  null,
        "category":  "Paid marketing \u0026 campaign economics",
        "subcategory":  "CAC, lead economics and payback",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are cost per lead, booked appointment and attended visit tracked separately?",
        "description":  null,
        "category":  "Paid marketing \u0026 campaign economics",
        "subcategory":  "CAC, lead economics and payback",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How many cases are needed to recover campaign spend?",
        "description":  null,
        "category":  "Paid marketing \u0026 campaign economics",
        "subcategory":  "CAC, lead economics and payback",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which service and patient segment is the campaign for?",
        "description":  null,
        "category":  "Paid marketing \u0026 campaign economics",
        "subcategory":  "Campaign design",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the landing page continue the ad\u0027s message?",
        "description":  null,
        "category":  "Paid marketing \u0026 campaign economics",
        "subcategory":  "Campaign design",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are geography, schedule and targeting suitable for clinic capacity?",
        "description":  null,
        "category":  "Paid marketing \u0026 campaign economics",
        "subcategory":  "Campaign design",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is the campaign creating demand the clinic can safely serve?",
        "description":  null,
        "category":  "Paid marketing \u0026 campaign economics",
        "subcategory":  "Campaign design",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What share of leads are relevant, reachable, booked and attended?",
        "description":  null,
        "category":  "Paid marketing \u0026 campaign economics",
        "subcategory":  "Lead quality and attribution",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are poor leads caused by targeting, message, form, price or response delay?",
        "description":  null,
        "category":  "Paid marketing \u0026 campaign economics",
        "subcategory":  "Lead quality and attribution",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can ad spend be connected to collected revenue?",
        "description":  null,
        "category":  "Paid marketing \u0026 campaign economics",
        "subcategory":  "Lead quality and attribution",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are existing patients incorrectly counted as newly acquired?",
        "description":  null,
        "category":  "Paid marketing \u0026 campaign economics",
        "subcategory":  "Lead quality and attribution",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the campaign comply with professional and platform rules?",
        "description":  null,
        "category":  "Paid marketing \u0026 campaign economics",
        "subcategory":  "Ethics and platform risk",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What happens if an ad account is suspended?",
        "description":  null,
        "category":  "Paid marketing \u0026 campaign economics",
        "subcategory":  "Ethics and platform risk",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is the clinic building channels it controls alongside paid reach?",
        "description":  null,
        "category":  "Paid marketing \u0026 campaign economics",
        "subcategory":  "Ethics and platform risk",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Where do enquiries arrive: phone, WhatsApp, website, Google, Instagram or walk-in?",
        "description":  null,
        "category":  "Enquiry handling \u0026 lead recovery",
        "subcategory":  "Enquiry capture",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are all enquiries recorded with source, time, service and outcome?",
        "description":  null,
        "category":  "Enquiry handling \u0026 lead recovery",
        "subcategory":  "Enquiry capture",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How many calls and messages are missed outside reception hours?",
        "description":  null,
        "category":  "Enquiry handling \u0026 lead recovery",
        "subcategory":  "Enquiry capture",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can staff identify urgent concerns and route them to a clinician?",
        "description":  null,
        "category":  "Enquiry handling \u0026 lead recovery",
        "subcategory":  "Enquiry capture",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How long does the clinic take to respond?",
        "description":  null,
        "category":  "Enquiry handling \u0026 lead recovery",
        "subcategory":  "Response speed",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How many leads are lost because another clinic responds first?",
        "description":  null,
        "category":  "Enquiry handling \u0026 lead recovery",
        "subcategory":  "Response speed",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Who owns unanswered calls and messages?",
        "description":  null,
        "category":  "Enquiry handling \u0026 lead recovery",
        "subcategory":  "Response speed",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How many enquiries are abandoned after one failed contact attempt?",
        "description":  null,
        "category":  "Enquiry handling \u0026 lead recovery",
        "subcategory":  "Response speed",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does every enquiry have a status and next action?",
        "description":  null,
        "category":  "Enquiry handling \u0026 lead recovery",
        "subcategory":  "Lead tracking, follow-up and recovery",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How many leads are lost because nobody follows up?",
        "description":  null,
        "category":  "Enquiry handling \u0026 lead recovery",
        "subcategory":  "Lead tracking, follow-up and recovery",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Why did patients not book: timing, fee, distance, doctor preference or uncertainty?",
        "description":  null,
        "category":  "Enquiry handling \u0026 lead recovery",
        "subcategory":  "Lead tracking, follow-up and recovery",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which lost leads merit a respectful follow-up?",
        "description":  null,
        "category":  "Enquiry handling \u0026 lead recovery",
        "subcategory":  "Lead tracking, follow-up and recovery",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How many enquiries go cold because the clinic never records a next action?",
        "description":  null,
        "category":  "Enquiry handling \u0026 lead recovery",
        "subcategory":  "Lead tracking, follow-up and recovery",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which enquiry statuses are actually useful to a receptionist, rather than creating CRM admin for its own sake?",
        "description":  null,
        "category":  "Enquiry handling \u0026 lead recovery",
        "subcategory":  "Lead tracking, follow-up and recovery",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can the owner see the value of unanswered calls and uncontacted web forms in one weekly report?",
        "description":  null,
        "category":  "Enquiry handling \u0026 lead recovery",
        "subcategory":  "Lead tracking, follow-up and recovery",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can reception explain services, fees, timings and booking rules accurately?",
        "description":  null,
        "category":  "Enquiry handling \u0026 lead recovery",
        "subcategory":  "Phone, WhatsApp and message handling",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are messages clear about location, preparation and next steps?",
        "description":  null,
        "category":  "Enquiry handling \u0026 lead recovery",
        "subcategory":  "Phone, WhatsApp and message handling",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are templates useful without sounding robotic?",
        "description":  null,
        "category":  "Enquiry handling \u0026 lead recovery",
        "subcategory":  "Phone, WhatsApp and message handling",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are sensitive details protected in messaging workflows?",
        "description":  null,
        "category":  "Enquiry handling \u0026 lead recovery",
        "subcategory":  "Phone, WhatsApp and message handling",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can patients understand walk-in, appointment and emergency access?",
        "description":  null,
        "category":  "Booking, access \u0026 attendance",
        "subcategory":  "Appointment design",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are slots based on actual consultation duration and doctor availability?",
        "description":  null,
        "category":  "Booking, access \u0026 attendance",
        "subcategory":  "Appointment design",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How much friction exists between deciding to book and getting a slot?",
        "description":  null,
        "category":  "Booking, access \u0026 attendance",
        "subcategory":  "Appointment design",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can patients cancel or reschedule easily?",
        "description":  null,
        "category":  "Booking, access \u0026 attendance",
        "subcategory":  "Appointment design",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What share of booked patients do not attend, by source and time?",
        "description":  null,
        "category":  "Booking, access \u0026 attendance",
        "subcategory":  "No-shows, cancellations and slot recovery",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which reminders reduce no-shows without annoying patients?",
        "description":  null,
        "category":  "Booking, access \u0026 attendance",
        "subcategory":  "No-shows, cancellations and slot recovery",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are no-shows concentrated in low-intent leads or long-wait slots?",
        "description":  null,
        "category":  "Booking, access \u0026 attendance",
        "subcategory":  "No-shows, cancellations and slot recovery",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can cancelled slots be offered to another patient quickly?",
        "description":  null,
        "category":  "Booking, access \u0026 attendance",
        "subcategory":  "No-shows, cancellations and slot recovery",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Do clinic hours work for working patients and caregivers?",
        "description":  null,
        "category":  "Booking, access \u0026 attendance",
        "subcategory":  "Convenience and accessibility",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are directions, parking, lift access and entry instructions clear?",
        "description":  null,
        "category":  "Booking, access \u0026 attendance",
        "subcategory":  "Convenience and accessibility",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can patients with mobility, language or digital-access needs book?",
        "description":  null,
        "category":  "Booking, access \u0026 attendance",
        "subcategory":  "Convenience and accessibility",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Would evening, weekend or teleconsultation slots have enough demand?",
        "description":  null,
        "category":  "Booking, access \u0026 attendance",
        "subcategory":  "Convenience and accessibility",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is actual waiting time from arrival to consultation?",
        "description":  null,
        "category":  "Booking, access \u0026 attendance",
        "subcategory":  "Waiting time",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How often does the clinic run late and why?",
        "description":  null,
        "category":  "Booking, access \u0026 attendance",
        "subcategory":  "Waiting time",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are walk-ins disrupting booked appointments?",
        "description":  null,
        "category":  "Booking, access \u0026 attendance",
        "subcategory":  "Waiting time",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can staff provide realistic wait estimates and updates?",
        "description":  null,
        "category":  "Booking, access \u0026 attendance",
        "subcategory":  "Waiting time",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the doctor use language suited to the patient\u0027s health literacy?",
        "description":  "Focus on access, clarity, service and expectations; not diagnosis, treatment advice or clinical judgement.",
        "category":  "Patient experience \u0026 communication",
        "subcategory":  "Communication and expectation-setting",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which communication habits cause repeated calls or poor adherence?",
        "description":  "Focus on access, clarity, service and expectations; not diagnosis, treatment advice or clinical judgement.",
        "category":  "Patient experience \u0026 communication",
        "subcategory":  "Communication and expectation-setting",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the patient know who to contact after consultation?",
        "description":  "Focus on access, clarity, service and expectations; not diagnosis, treatment advice or clinical judgement.",
        "category":  "Patient experience \u0026 communication",
        "subcategory":  "Continuity and handoffs",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are referrals, investigations and follow-up instructions handed over clearly?",
        "description":  "Focus on access, clarity, service and expectations; not diagnosis, treatment advice or clinical judgement.",
        "category":  "Patient experience \u0026 communication",
        "subcategory":  "Continuity and handoffs",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can another clinician understand the plan from the record?",
        "description":  "Focus on access, clarity, service and expectations; not diagnosis, treatment advice or clinical judgement.",
        "category":  "Patient experience \u0026 communication",
        "subcategory":  "Continuity and handoffs",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Where do patients get lost between consultation, investigation and review?",
        "description":  "Focus on access, clarity, service and expectations; not diagnosis, treatment advice or clinical judgement.",
        "category":  "Patient experience \u0026 communication",
        "subcategory":  "Continuity and handoffs",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How does the clinic respond to complaints about waiting, staff or billing?",
        "description":  "Focus on access, clarity, service and expectations; not diagnosis, treatment advice or clinical judgement.",
        "category":  "Patient experience \u0026 communication",
        "subcategory":  "Complaints and service recovery",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Who can fix a service problem immediately?",
        "description":  "Focus on access, clarity, service and expectations; not diagnosis, treatment advice or clinical judgement.",
        "category":  "Patient experience \u0026 communication",
        "subcategory":  "Complaints and service recovery",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are complaints reviewed for recurring causes?",
        "description":  "Focus on access, clarity, service and expectations; not diagnosis, treatment advice or clinical judgement.",
        "category":  "Patient experience \u0026 communication",
        "subcategory":  "Complaints and service recovery",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which complaints reveal a system failure?",
        "description":  "Focus on access, clarity, service and expectations; not diagnosis, treatment advice or clinical judgement.",
        "category":  "Patient experience \u0026 communication",
        "subcategory":  "Complaints and service recovery",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What share of patients who need review actually return?",
        "description":  "Focus on administrative recall and appropriate follow-up workflow; clinical timing/content must be set by the treating doctor.",
        "category":  "Follow-up systems \u0026 patient retention",
        "subcategory":  "Follow-up reminders and workflow",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are follow-up dates and reasons recorded before patients leave?",
        "description":  "Focus on administrative recall and appropriate follow-up workflow; clinical timing/content must be set by the treating doctor.",
        "category":  "Follow-up systems \u0026 patient retention",
        "subcategory":  "Follow-up reminders and workflow",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Who checks missed follow-ups?",
        "description":  "Focus on administrative recall and appropriate follow-up workflow; clinical timing/content must be set by the treating doctor.",
        "category":  "Follow-up systems \u0026 patient retention",
        "subcategory":  "Follow-up reminders and workflow",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Do reminders explain why review matters and how to reschedule?",
        "description":  "Focus on administrative recall and appropriate follow-up workflow; clinical timing/content must be set by the treating doctor.",
        "category":  "Follow-up systems \u0026 patient retention",
        "subcategory":  "Follow-up reminders and workflow",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What share of patients return when clinically appropriate?",
        "description":  "Focus on administrative recall and appropriate follow-up workflow; clinical timing/content must be set by the treating doctor.",
        "category":  "Follow-up systems \u0026 patient retention",
        "subcategory":  "Repeat visits and retention",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How does retention vary by condition, doctor, service and acquisition source?",
        "description":  "Focus on administrative recall and appropriate follow-up workflow; clinical timing/content must be set by the treating doctor.",
        "category":  "Follow-up systems \u0026 patient retention",
        "subcategory":  "Repeat visits and retention",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Why do patients switch providers or stop attending?",
        "description":  "Focus on administrative recall and appropriate follow-up workflow; clinical timing/content must be set by the treating doctor.",
        "category":  "Follow-up systems \u0026 patient retention",
        "subcategory":  "Repeat visits and retention",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How much revenue comes from appropriate repeat care versus new acquisition?",
        "description":  "Focus on administrative recall and appropriate follow-up workflow; clinical timing/content must be set by the treating doctor.",
        "category":  "Follow-up systems \u0026 patient retention",
        "subcategory":  "Repeat visits and retention",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which patient groups are overdue for clinically appropriate review?",
        "description":  "Focus on administrative recall and appropriate follow-up workflow; clinical timing/content must be set by the treating doctor.",
        "category":  "Follow-up systems \u0026 patient retention",
        "subcategory":  "Lapsed-patient reactivation",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can lapsed patients be identified without indiscriminate promotions?",
        "description":  "Focus on administrative recall and appropriate follow-up workflow; clinical timing/content must be set by the treating doctor.",
        "category":  "Follow-up systems \u0026 patient retention",
        "subcategory":  "Lapsed-patient reactivation",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which reactivation messages are useful and respectful?",
        "description":  "Focus on administrative recall and appropriate follow-up workflow; clinical timing/content must be set by the treating doctor.",
        "category":  "Follow-up systems \u0026 patient retention",
        "subcategory":  "Lapsed-patient reactivation",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How are opt-outs and transferred care handled?",
        "description":  "Focus on administrative recall and appropriate follow-up workflow; clinical timing/content must be set by the treating doctor.",
        "category":  "Follow-up systems \u0026 patient retention",
        "subcategory":  "Lapsed-patient reactivation",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How many new patients arrive through existing-patient recommendations?",
        "description":  "Focus on source attribution and relationship systems, not clinical referral decisions or professional association rules.",
        "category":  "Word of mouth, referrals \u0026 reputation",
        "subcategory":  "Patient word of mouth",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What makes patients comfortable recommending the clinic?",
        "description":  "Focus on source attribution and relationship systems, not clinical referral decisions or professional association rules.",
        "category":  "Word of mouth, referrals \u0026 reputation",
        "subcategory":  "Patient word of mouth",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Do patients know which problems the clinic can handle?",
        "description":  "Focus on source attribution and relationship systems, not clinical referral decisions or professional association rules.",
        "category":  "Word of mouth, referrals \u0026 reputation",
        "subcategory":  "Patient word of mouth",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can sharing contact details be made easy without improper inducements?",
        "description":  "Focus on source attribution and relationship systems, not clinical referral decisions or professional association rules.",
        "category":  "Word of mouth, referrals \u0026 reputation",
        "subcategory":  "Patient word of mouth",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How do experience, outcomes, reviews and word of mouth reinforce discovery?",
        "description":  "Focus on source attribution and relationship systems, not clinical referral decisions or professional association rules.",
        "category":  "Word of mouth, referrals \u0026 reputation",
        "subcategory":  "Reputation and referral loop",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which part of this loop is weakest?",
        "description":  "Focus on source attribution and relationship systems, not clinical referral decisions or professional association rules.",
        "category":  "Word of mouth, referrals \u0026 reputation",
        "subcategory":  "Reputation and referral loop",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can declining ratings be linked to operational causes?",
        "description":  "Focus on source attribution and relationship systems, not clinical referral decisions or professional association rules.",
        "category":  "Word of mouth, referrals \u0026 reputation",
        "subcategory":  "Reputation and referral loop",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is reputation built on consistent care or occasional marketing?",
        "description":  "Focus on source attribution and relationship systems, not clinical referral decisions or professional association rules.",
        "category":  "Word of mouth, referrals \u0026 reputation",
        "subcategory":  "Reputation and referral loop",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How are consultation, follow-up, procedure and investigation fees structured?",
        "description":  null,
        "category":  "Pricing, offers \u0026 perceived value",
        "subcategory":  "Fee structure and fee communication",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are fees understandable before arrival?",
        "description":  null,
        "category":  "Pricing, offers \u0026 perceived value",
        "subcategory":  "Fee structure and fee communication",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is the follow-up fee policy clear?",
        "description":  null,
        "category":  "Pricing, offers \u0026 perceived value",
        "subcategory":  "Fee structure and fee communication",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are prices based on costs, patient value, local market or habit?",
        "description":  null,
        "category":  "Pricing, offers \u0026 perceived value",
        "subcategory":  "Fee structure and fee communication",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How much contribution margin is lost after a 5%, 10% or 20% discount?",
        "description":  null,
        "category":  "Pricing, offers \u0026 perceived value",
        "subcategory":  "Discounts and contribution margin",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How many extra patients are needed to offset a discount?",
        "description":  null,
        "category":  "Pricing, offers \u0026 perceived value",
        "subcategory":  "Discounts and contribution margin",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does discounting create incremental demand or reduce revenue from full-price patients?",
        "description":  null,
        "category":  "Pricing, offers \u0026 perceived value",
        "subcategory":  "Discounts and contribution margin",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are discounts creating a reference price that is hard to reverse?",
        "description":  null,
        "category":  "Pricing, offers \u0026 perceived value",
        "subcategory":  "Discounts and contribution margin",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does a package reflect a clinically coherent course of care?",
        "description":  null,
        "category":  "Pricing, offers \u0026 perceived value",
        "subcategory":  "Packages and structured service offers",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are inclusions, exclusions, expiry and refund terms clear?",
        "description":  null,
        "category":  "Pricing, offers \u0026 perceived value",
        "subcategory":  "Packages and structured service offers",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Could a package encourage unnecessary visits or tests?",
        "description":  null,
        "category":  "Pricing, offers \u0026 perceived value",
        "subcategory":  "Packages and structured service offers",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How should unused services and future delivery costs be accounted for?",
        "description":  null,
        "category":  "Pricing, offers \u0026 perceived value",
        "subcategory":  "Packages and structured service offers",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does \u0027too expensive\u0027 mean unaffordable, low trust, poor perceived value or comparison?",
        "description":  null,
        "category":  "Pricing, offers \u0026 perceived value",
        "subcategory":  "Price objections and perceived value",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can staff explain fees without arguing or making clinical claims?",
        "description":  null,
        "category":  "Pricing, offers \u0026 perceived value",
        "subcategory":  "Price objections and perceived value",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are patients surprised by extra charges?",
        "description":  null,
        "category":  "Pricing, offers \u0026 perceived value",
        "subcategory":  "Price objections and perceived value",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which objections reveal a communication problem versus a market mismatch?",
        "description":  null,
        "category":  "Pricing, offers \u0026 perceived value",
        "subcategory":  "Price objections and perceived value",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How much revenue comes from consultations, procedures and diagnostics?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Revenue quality",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is revenue growing because of volume, price or service mix?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Revenue quality",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is collected revenue after discounts, refunds and unpaid bills?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Revenue quality",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which services generate revenue but consume disproportionate doctor time?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Revenue quality",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What are variable costs for each service?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Contribution margin",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What contribution remains after consumables, outsourced fees and payment costs?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Contribution margin",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which high-revenue services have low contribution?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Contribution margin",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are doctor time and opportunity cost included?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Contribution margin",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which service has the highest contribution per doctor-hour, not just the highest bill value?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Contribution margin",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How does the margin change when a doctor personally performs work that could safely be handled by a trained team member?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Contribution margin",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which costs are truly variable and which remain even when patient volume falls?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Contribution margin",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What are fixed monthly costs including rent, salaries, software and loans?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Fixed costs and break-even",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How many consultations or procedures cover fixed costs?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Fixed costs and break-even",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is the break-even point for a new service?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Fixed costs and break-even",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How sensitive is break-even to lower volume or higher costs?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Fixed costs and break-even",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "When does revenue arrive versus when bills are due?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Cash flow",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How much cash is tied up in receivables, inventory and equipment?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Cash flow",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How should delayed insurance or corporate payments be planned for?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Cash flow",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is cash runway under a realistic downside case?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Cash flow",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is revenue and contribution per doctor hour, room hour and equipment hour?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Revenue per doctor-hour, room-hour and equipment-hour",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which appointment types consume the most time relative to contribution?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Revenue per doctor-hour, room-hour and equipment-hour",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How much revenue is lost through empty slots and overruns?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Revenue per doctor-hour, room-hour and equipment-hour",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is the current binding capacity constraint?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Revenue per doctor-hour, room-hour and equipment-hour",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are daily collections reconciled with appointments and bills?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Financial controls",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are personal and clinic expenses separated?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Financial controls",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are discounts, refunds, dues and subscriptions reviewed?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Financial controls",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which financial numbers should trigger an operational decision?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Financial controls",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How many cases per month justify owning equipment?",
        "description":  null,
        "category":  "Equipment, rooms \u0026 capital investment",
        "subcategory":  "Buy, lease, rent or outsource",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is full ownership cost including financing, installation, service and consumables?",
        "description":  null,
        "category":  "Equipment, rooms \u0026 capital investment",
        "subcategory":  "Buy, lease, rent or outsource",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What would outsourcing cost at current volumes?",
        "description":  null,
        "category":  "Equipment, rooms \u0026 capital investment",
        "subcategory":  "Buy, lease, rent or outsource",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What happens if demand is 30% below forecast?",
        "description":  null,
        "category":  "Equipment, rooms \u0026 capital investment",
        "subcategory":  "Buy, lease, rent or outsource",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How many hours per week is equipment actually used?",
        "description":  null,
        "category":  "Equipment, rooms \u0026 capital investment",
        "subcategory":  "Equipment utilisation and scheduling",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How much capacity is lost to setup, cleaning, maintenance and idle gaps?",
        "description":  null,
        "category":  "Equipment, rooms \u0026 capital investment",
        "subcategory":  "Equipment utilisation and scheduling",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is utilisation limited by demand, trained staff, room or scheduling?",
        "description":  null,
        "category":  "Equipment, rooms \u0026 capital investment",
        "subcategory":  "Equipment utilisation and scheduling",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is contribution per productive equipment hour?",
        "description":  null,
        "category":  "Equipment, rooms \u0026 capital investment",
        "subcategory":  "Equipment utilisation and scheduling",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What are payback period, break-even volume and downside case?",
        "description":  null,
        "category":  "Equipment, rooms \u0026 capital investment",
        "subcategory":  "Capital investment appraisal",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How should depreciation, financing and resale value be treated?",
        "description":  null,
        "category":  "Equipment, rooms \u0026 capital investment",
        "subcategory":  "Capital investment appraisal",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is the opportunity cost versus hiring, marketing or working capital?",
        "description":  null,
        "category":  "Equipment, rooms \u0026 capital investment",
        "subcategory":  "Capital investment appraisal",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What volume has the clinic actually observed, rather than forecast, before buying the machine?",
        "description":  null,
        "category":  "Equipment, rooms \u0026 capital investment",
        "subcategory":  "Capital investment appraisal",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How much demand must be diverted from competitors or outsourced providers to reach break-even?",
        "description":  null,
        "category":  "Equipment, rooms \u0026 capital investment",
        "subcategory":  "Capital investment appraisal",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the equipment create a new patient acquisition channel or only shift existing patients between services?",
        "description":  null,
        "category":  "Equipment, rooms \u0026 capital investment",
        "subcategory":  "Capital investment appraisal",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is the cost of an idle machine after including space, staff attention and maintenance?",
        "description":  null,
        "category":  "Equipment, rooms \u0026 capital investment",
        "subcategory":  "Capital investment appraisal",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is the maximum safe patient volume per day?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "Capacity planning",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which resource is the binding constraint at peak hours?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "Capacity planning",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How does consultation duration vary by new, follow-up and procedure visits?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "Capacity planning",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How many appointment slots are intentionally kept open for variability, urgent requests and overruns?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "Capacity planning",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "At what utilisation does the clinic start losing new patients because the next available slot is too far away?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "Capacity planning",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is the apparent capacity problem caused by the doctor\u0027s schedule or by room, staff and process constraints?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "Capacity planning",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How many steps and handoffs occur from arrival to departure?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "Patient flow and process design",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Where do queues form and why?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "Patient flow and process design",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which tasks can happen before arrival safely?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "Patient flow and process design",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How can waiting be reduced without rushing consultations?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "Patient flow and process design",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which recurring tasks depend on memory rather than a written process?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "SOPs",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are opening, closing, cleaning and cash handling standardised?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "SOPs",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can a new staff member perform tasks from the SOP?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "SOPs",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Who owns each process and exception?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "SOPs",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which consumables are critical, expensive or perishable?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "Inventory",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How much cash is tied up in slow-moving inventory?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "Inventory",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are expiry, batch and storage records maintained?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "Inventory",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can the clinic operate without the owner present?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "Second location and expansion readiness",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which systems must be standardised before another location?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "Second location and expansion readiness",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Will a second location reach new demand or split existing demand?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "Second location and expansion readiness",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How will quality, cash and staff performance be monitored?",
        "description":  null,
        "category":  "Capacity, scheduling \u0026 clinic operations",
        "subcategory":  "Second location and expansion readiness",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can reception explain services, fees and booking rules accurately?",
        "description":  null,
        "category":  "Front desk, hiring \u0026 delegation",
        "subcategory":  "Reception performance and enquiry conversion",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How many calls are missed or poorly handled?",
        "description":  null,
        "category":  "Front desk, hiring \u0026 delegation",
        "subcategory":  "Reception performance and enquiry conversion",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can staff recognise when a question needs a clinician?",
        "description":  null,
        "category":  "Front desk, hiring \u0026 delegation",
        "subcategory":  "Reception performance and enquiry conversion",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are staff measured on accuracy and patient experience rather than pressure to sell?",
        "description":  null,
        "category":  "Front desk, hiring \u0026 delegation",
        "subcategory":  "Reception performance and enquiry conversion",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does reception end an enquiry with a clear next step, or simply answer the question and wait?",
        "description":  null,
        "category":  "Front desk, hiring \u0026 delegation",
        "subcategory":  "Reception performance and enquiry conversion",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can the owner review a small sample of calls each week to find patterns in lost bookings?",
        "description":  null,
        "category":  "Front desk, hiring \u0026 delegation",
        "subcategory":  "Reception performance and enquiry conversion",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are staff given authority to solve routine access problems without repeatedly asking the doctor?",
        "description":  null,
        "category":  "Front desk, hiring \u0026 delegation",
        "subcategory":  "Reception performance and enquiry conversion",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which tasks consume doctor time but do not require doctor training?",
        "description":  null,
        "category":  "Front desk, hiring \u0026 delegation",
        "subcategory":  "Hiring and role economics",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is the economic value of the doctor\u0027s time on each task?",
        "description":  null,
        "category":  "Front desk, hiring \u0026 delegation",
        "subcategory":  "Hiring and role economics",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "When does workload justify a receptionist, coordinator, nurse or junior doctor?",
        "description":  null,
        "category":  "Front desk, hiring \u0026 delegation",
        "subcategory":  "Hiring and role economics",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are responsibilities clear enough to prevent dropped tasks?",
        "description":  null,
        "category":  "Front desk, hiring \u0026 delegation",
        "subcategory":  "Hiring and role economics",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can staff demonstrate the workflow rather than say they understand it?",
        "description":  null,
        "category":  "Front desk, hiring \u0026 delegation",
        "subcategory":  "Staff training, targets and incentives",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which skills need scripts, role-play or checklists?",
        "description":  null,
        "category":  "Front desk, hiring \u0026 delegation",
        "subcategory":  "Staff training, targets and incentives",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Do incentives reward safety, accuracy and service quality?",
        "description":  null,
        "category":  "Front desk, hiring \u0026 delegation",
        "subcategory":  "Staff training, targets and incentives",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Could conversion targets encourage inappropriate pressure?",
        "description":  null,
        "category":  "Front desk, hiring \u0026 delegation",
        "subcategory":  "Staff training, targets and incentives",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which decisions stop when the doctor-owner is absent?",
        "description":  null,
        "category":  "Front desk, hiring \u0026 delegation",
        "subcategory":  "Owner dependence and delegation",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What information does the owner repeatedly have to provide?",
        "description":  null,
        "category":  "Front desk, hiring \u0026 delegation",
        "subcategory":  "Owner dependence and delegation",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which decisions can be delegated with clear limits?",
        "description":  null,
        "category":  "Front desk, hiring \u0026 delegation",
        "subcategory":  "Owner dependence and delegation",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What would break if the owner took a week away?",
        "description":  null,
        "category":  "Front desk, hiring \u0026 delegation",
        "subcategory":  "Owner dependence and delegation",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which medical terms do patients misunderstand?",
        "description":  null,
        "category":  "Patient psychology \u0026 buying behaviour",
        "subcategory":  "Plain-language communication",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which formats improve comprehension: verbal, written, diagram or video?",
        "description":  null,
        "category":  "Patient psychology \u0026 buying behaviour",
        "subcategory":  "Plain-language communication",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are digital instructions usable for patients with limited literacy?",
        "description":  null,
        "category":  "Patient psychology \u0026 buying behaviour",
        "subcategory":  "Plain-language communication",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Who influences doctor and treatment choice?",
        "description":  null,
        "category":  "Patient psychology \u0026 buying behaviour",
        "subcategory":  "Family influence on clinic choice",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How do community recommendations affect care-seeking?",
        "description":  null,
        "category":  "Patient psychology \u0026 buying behaviour",
        "subcategory":  "Family influence on clinic choice",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is caregiver communication appropriately consented?",
        "description":  null,
        "category":  "Patient psychology \u0026 buying behaviour",
        "subcategory":  "Family influence on clinic choice",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Why do patients delay booking after recognising a health problem?",
        "description":  null,
        "category":  "Patient psychology \u0026 buying behaviour",
        "subcategory":  "Inertia, delay and booking friction",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which steps create enough friction to postpone care?",
        "description":  null,
        "category":  "Patient psychology \u0026 buying behaviour",
        "subcategory":  "Inertia, delay and booking friction",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How do work, travel and caregiving affect decisions?",
        "description":  null,
        "category":  "Patient psychology \u0026 buying behaviour",
        "subcategory":  "Inertia, delay and booking friction",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which reminders help without pressuring patients?",
        "description":  null,
        "category":  "Patient psychology \u0026 buying behaviour",
        "subcategory":  "Inertia, delay and booking friction",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which signals make patients perceive competence and trustworthiness?",
        "description":  null,
        "category":  "Patient psychology \u0026 buying behaviour",
        "subcategory":  "How patients compare clinics",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How do patients compare qualifications, reviews, fees and facilities?",
        "description":  null,
        "category":  "Patient psychology \u0026 buying behaviour",
        "subcategory":  "How patients compare clinics",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "When does confident communication become an unsupported claim?",
        "description":  null,
        "category":  "Patient psychology \u0026 buying behaviour",
        "subcategory":  "How patients compare clinics",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What helps patients make an informed choice between providers?",
        "description":  null,
        "category":  "Patient psychology \u0026 buying behaviour",
        "subcategory":  "How patients compare clinics",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can common patient journeys be organised into clear stages without rigid care?",
        "description":  null,
        "category":  "Service design \u0026 new revenue lines",
        "subcategory":  "Structured service journeys",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What should happen at first visit, investigation, review and follow-up?",
        "description":  null,
        "category":  "Service design \u0026 new revenue lines",
        "subcategory":  "Structured service journeys",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which steps are clinically necessary versus administrative friction?",
        "description":  null,
        "category":  "Service design \u0026 new revenue lines",
        "subcategory":  "Structured service journeys",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can patients understand expected time and cost?",
        "description":  null,
        "category":  "Service design \u0026 new revenue lines",
        "subcategory":  "Structured service journeys",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is there a genuine clinical reason for ongoing monitoring?",
        "description":  null,
        "category":  "Service design \u0026 new revenue lines",
        "subcategory":  "Programs, packages and memberships",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is included and separately billed?",
        "description":  null,
        "category":  "Service design \u0026 new revenue lines",
        "subcategory":  "Programs, packages and memberships",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Could the model encourage unnecessary visits?",
        "description":  null,
        "category":  "Service design \u0026 new revenue lines",
        "subcategory":  "Programs, packages and memberships",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What are delivery costs and capacity requirements per member?",
        "description":  null,
        "category":  "Service design \u0026 new revenue lines",
        "subcategory":  "Programs, packages and memberships",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What repeated patient problem justifies a new service?",
        "description":  null,
        "category":  "Service design \u0026 new revenue lines",
        "subcategory":  "Testing a new service before investing",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can demand be validated before buying equipment or hiring?",
        "description":  null,
        "category":  "Service design \u0026 new revenue lines",
        "subcategory":  "Testing a new service before investing",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the service fit the doctor\u0027s competence and facility?",
        "description":  null,
        "category":  "Service design \u0026 new revenue lines",
        "subcategory":  "Testing a new service before investing",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is the smallest safe pilot?",
        "description":  null,
        "category":  "Service design \u0026 new revenue lines",
        "subcategory":  "Testing a new service before investing",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which workflows rely on paper, spreadsheets, WhatsApp or memory?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "EMR and practice-management fit",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the EMR fit the specialty\u0027s consultation and documentation needs?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "EMR and practice-management fit",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can appointments, records, billing and follow-up use one reliable patient identity?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "EMR and practice-management fit",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How much duplicate data entry exists?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "EMR and practice-management fit",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which repetitive administrative tasks are frequent and rule-based?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "Administrative automation",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can reminders, confirmations and receipts be automated safely?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "Administrative automation",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Where is human review essential?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "Administrative automation",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How will failed messages and duplicate records be detected?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "Administrative automation",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can records be exported if the clinic changes software?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "Data ownership, portability and interoperability",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the system support relevant Indian digital health standards?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "Data ownership, portability and interoperability",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How is information shared with consent?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "Data ownership, portability and interoperability",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which cases are suitable for teleconsultation and which need physical examination?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "Teleconsultation operations",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can patients book, pay, connect and receive records easily?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "Teleconsultation operations",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How are emergencies and technical failures handled?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "Teleconsultation operations",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which NMC, state council and other rules govern clinic communication?",
        "description":  "Operational/communication framing only; verify current rules with authoritative professional guidance.",
        "category":  "Digital compliance, privacy \u0026 operational risk",
        "subcategory":  "Medical content and professional advertising rules",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are claims, guarantees, testimonials and patient images permitted?",
        "description":  "Operational/communication framing only; verify current rules with authoritative professional guidance.",
        "category":  "Digital compliance, privacy \u0026 operational risk",
        "subcategory":  "Medical content and professional advertising rules",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How should education be separated from personalised medical advice?",
        "description":  "Operational/communication framing only; verify current rules with authoritative professional guidance.",
        "category":  "Digital compliance, privacy \u0026 operational risk",
        "subcategory":  "Medical content and professional advertising rules",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Who reviews clinical claims before publication?",
        "description":  "Operational/communication framing only; verify current rules with authoritative professional guidance.",
        "category":  "Digital compliance, privacy \u0026 operational risk",
        "subcategory":  "Medical content and professional advertising rules",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the workflow meet applicable Indian telemedicine requirements?",
        "description":  "Operational/communication framing only; verify current rules with authoritative professional guidance.",
        "category":  "Digital compliance, privacy \u0026 operational risk",
        "subcategory":  "Telemedicine workflow and compliance",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are there clear limits on remote care?",
        "description":  "Operational/communication framing only; verify current rules with authoritative professional guidance.",
        "category":  "Digital compliance, privacy \u0026 operational risk",
        "subcategory":  "Telemedicine workflow and compliance",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How are physical examination and emergency referrals documented?",
        "description":  "Operational/communication framing only; verify current rules with authoritative professional guidance.",
        "category":  "Digital compliance, privacy \u0026 operational risk",
        "subcategory":  "Telemedicine workflow and compliance",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Who can access records, messages and billing data?",
        "description":  "Operational/communication framing only; verify current rules with authoritative professional guidance.",
        "category":  "Digital compliance, privacy \u0026 operational risk",
        "subcategory":  "Patient data privacy and access control",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are patient images and stories used with appropriate permission?",
        "description":  "Operational/communication framing only; verify current rules with authoritative professional guidance.",
        "category":  "Digital compliance, privacy \u0026 operational risk",
        "subcategory":  "Patient data privacy and access control",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Do devices, backups or messaging groups expose patient information?",
        "description":  "Operational/communication framing only; verify current rules with authoritative professional guidance.",
        "category":  "Digital compliance, privacy \u0026 operational risk",
        "subcategory":  "Patient data privacy and access control",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is the response plan for a lost device or data breach?",
        "description":  "Operational/communication framing only; verify current rules with authoritative professional guidance.",
        "category":  "Digital compliance, privacy \u0026 operational risk",
        "subcategory":  "Patient data privacy and access control",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which business skills does a doctor need to run a clinic?",
        "description":  null,
        "category":  "Doctor-owner psychology \u0026 decision-making",
        "subcategory":  "Doctor-to-owner transition",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which owner responsibilities are avoided because they feel unfamiliar?",
        "description":  null,
        "category":  "Doctor-owner psychology \u0026 decision-making",
        "subcategory":  "Doctor-to-owner transition",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the doctor understand the clinic\u0027s numbers?",
        "description":  null,
        "category":  "Doctor-owner psychology \u0026 decision-making",
        "subcategory":  "Doctor-to-owner transition",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Why are doctors reluctant to publish educational content or show their clinic?",
        "description":  null,
        "category":  "Doctor-owner psychology \u0026 decision-making",
        "subcategory":  "Doctor visibility and fear of posting",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which concerns are genuine compliance risks versus fear of judgement?",
        "description":  null,
        "category":  "Doctor-owner psychology \u0026 decision-making",
        "subcategory":  "Doctor visibility and fear of posting",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How can doctors build visibility without constant self-promotion?",
        "description":  null,
        "category":  "Doctor-owner psychology \u0026 decision-making",
        "subcategory":  "Doctor visibility and fear of posting",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is the cost of remaining invisible where patients search online?",
        "description":  null,
        "category":  "Doctor-owner psychology \u0026 decision-making",
        "subcategory":  "Doctor visibility and fear of posting",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is the owner solving the largest constraint or the most irritating problem?",
        "description":  null,
        "category":  "Doctor-owner psychology \u0026 decision-making",
        "subcategory":  "Owner decision-making and prioritisation",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which decisions rely on anecdotes instead of data?",
        "description":  null,
        "category":  "Doctor-owner psychology \u0026 decision-making",
        "subcategory":  "Owner decision-making and prioritisation",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How many growth projects can the clinic execute at once?",
        "description":  null,
        "category":  "Doctor-owner psychology \u0026 decision-making",
        "subcategory":  "Owner decision-making and prioritisation",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is the owner buying equipment, hiring or running ads because it feels like progress rather than because the bottleneck is known?",
        "description":  null,
        "category":  "Doctor-owner psychology \u0026 decision-making",
        "subcategory":  "Owner decision-making and prioritisation",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which recurring decision is delayed because the owner does not trust the numbers?",
        "description":  null,
        "category":  "Doctor-owner psychology \u0026 decision-making",
        "subcategory":  "Owner decision-making and prioritisation",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the owner have a weekly review habit, or only look at performance when cash feels tight?",
        "description":  null,
        "category":  "Doctor-owner psychology \u0026 decision-making",
        "subcategory":  "Owner decision-making and prioritisation",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How much time goes to clinical work, administration and management?",
        "description":  null,
        "category":  "Doctor-owner psychology \u0026 decision-making",
        "subcategory":  "Owner workload and time economics",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which tasks create avoidable cognitive load?",
        "description":  null,
        "category":  "Doctor-owner psychology \u0026 decision-making",
        "subcategory":  "Owner workload and time economics",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is growth increasing owner dependence and working hours?",
        "description":  null,
        "category":  "Doctor-owner psychology \u0026 decision-making",
        "subcategory":  "Owner workload and time economics",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What systems let the clinic function during the doctor\u0027s absence?",
        "description":  null,
        "category":  "Doctor-owner psychology \u0026 decision-making",
        "subcategory":  "Owner workload and time economics",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "At which stage does flow fall: awareness, enquiry, booking, attendance, treatment, follow-up or referral?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Patient-flow diagnosis",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is the denominator for each conversion rate?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Patient-flow diagnosis",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is the issue demand, patient mix or capacity?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Patient-flow diagnosis",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which stage causes the largest absolute and relative loss?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Patient-flow diagnosis",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is the clinic seeing fewer new patients, fewer total visits, or fewer high-value service bookings?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Patient-flow diagnosis",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are patients disappearing before contact, after contact, after booking, or after the first visit?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Patient-flow diagnosis",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is the apparent decline a real fall in demand or a reporting/recording change?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Patient-flow diagnosis",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which diagnosis would lead to a completely different intervention from \u0027post more content\u0027?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Patient-flow diagnosis",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which weekly metrics show clinic health?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Clinic dashboard and core metrics",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can the clinic track new-patient ratio, source mix, show rate and retention?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Clinic dashboard and core metrics",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are financial and operational metrics linked?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Clinic dashboard and core metrics",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which metrics are leading indicators versus lagging results?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Clinic dashboard and core metrics",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can the clinic calculate new-patient share, source mix, enquiry-to-booking rate and show rate every month?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Clinic dashboard and core metrics",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can it track procedure enquiries separately from completed procedures without treating every non-conversion as a sales failure?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Clinic dashboard and core metrics",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the dashboard show both volume and value, so a rise in visits does not hide a fall in contribution?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Clinic dashboard and core metrics",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can the owner compare the same month year-on-year to account for seasonality?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Clinic dashboard and core metrics",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What single change is being tested and what counts as success?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Experiments and testing",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is the baseline and comparison period?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Experiments and testing",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Could seasonality or doctor leave explain the change?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Experiments and testing",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How much data is needed before deciding?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Experiments and testing",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can source, enquiry, booking, attendance, treatment and revenue be linked?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Attribution and data quality",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which data fields are essential and which burden staff?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Attribution and data quality",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How are missing and duplicate records handled?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Attribution and data quality",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can the clinic distinguish correlation from incremental impact?",
        "description":  null,
        "category":  "Clinic diagnosis, metrics \u0026 experiments",
        "subcategory":  "Attribution and data quality",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is the binding constraint: demand, conversion, capacity, cash, staff or capability?",
        "description":  null,
        "category":  "Growth strategy \u0026 business resilience",
        "subcategory":  "Bottleneck diagnosis and growth priorities",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Would more marketing worsen the current bottleneck?",
        "description":  null,
        "category":  "Growth strategy \u0026 business resilience",
        "subcategory":  "Bottleneck diagnosis and growth priorities",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which change has the best return relative to cost and owner time?",
        "description":  null,
        "category":  "Growth strategy \u0026 business resilience",
        "subcategory":  "Bottleneck diagnosis and growth priorities",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What must be fixed before increasing volume?",
        "description":  null,
        "category":  "Growth strategy \u0026 business resilience",
        "subcategory":  "Bottleneck diagnosis and growth priorities",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which institutions or professionals reach the intended patient segment?",
        "description":  null,
        "category":  "Growth strategy \u0026 business resilience",
        "subcategory":  "Local partnerships and distribution",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can partnerships improve access without compromising referral independence?",
        "description":  null,
        "category":  "Growth strategy \u0026 business resilience",
        "subcategory":  "Local partnerships and distribution",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How will incremental patients be measured?",
        "description":  null,
        "category":  "Growth strategy \u0026 business resilience",
        "subcategory":  "Local partnerships and distribution",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What operational capacity is needed if a partnership works?",
        "description":  null,
        "category":  "Growth strategy \u0026 business resilience",
        "subcategory":  "Local partnerships and distribution",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What happens if Instagram reach falls or an ad account is suspended?",
        "description":  null,
        "category":  "Growth strategy \u0026 business resilience",
        "subcategory":  "Platform dependence and owned channels",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which channels provide durable discovery rather than rented attention?",
        "description":  null,
        "category":  "Growth strategy \u0026 business resilience",
        "subcategory":  "Platform dependence and owned channels",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How can channels be diversified without spreading effort too thin?",
        "description":  null,
        "category":  "Growth strategy \u0026 business resilience",
        "subcategory":  "Platform dependence and owned channels",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "If Instagram disappeared tomorrow, how would a patient who already knows the doctor find the clinic?",
        "description":  null,
        "category":  "Growth strategy \u0026 business resilience",
        "subcategory":  "Platform dependence and owned channels",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which audience relationships are genuinely owned and which are rented from a platform?",
        "description":  null,
        "category":  "Growth strategy \u0026 business resilience",
        "subcategory":  "Platform dependence and owned channels",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What happens if the lead doctor is unavailable for two weeks?",
        "description":  null,
        "category":  "Growth strategy \u0026 business resilience",
        "subcategory":  "Business continuity and downside planning",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How would the clinic manage a sudden fall in volume or delayed payments?",
        "description":  null,
        "category":  "Growth strategy \u0026 business resilience",
        "subcategory":  "Business continuity and downside planning",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which suppliers, platforms or staff are single points of failure?",
        "description":  null,
        "category":  "Growth strategy \u0026 business resilience",
        "subcategory":  "Business continuity and downside planning",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What reserves and continuity procedures are appropriate?",
        "description":  null,
        "category":  "Growth strategy \u0026 business resilience",
        "subcategory":  "Business continuity and downside planning",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How do economics differ between consultation-led, procedure-led and diagnostic practices?",
        "description":  null,
        "category":  "Specialty economics \u0026 practice models",
        "subcategory":  "Specialty-specific economics",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which specialties depend on episodic versus longitudinal care?",
        "description":  null,
        "category":  "Specialty economics \u0026 practice models",
        "subcategory":  "Specialty-specific economics",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How do referral patterns and urgency differ by specialty?",
        "description":  null,
        "category":  "Specialty economics \u0026 practice models",
        "subcategory":  "Specialty-specific economics",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which generic clinic metrics become misleading in this specialty?",
        "description":  null,
        "category":  "Specialty economics \u0026 practice models",
        "subcategory":  "Specialty-specific economics",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which systems are essential for a solo doctor versus a team?",
        "description":  null,
        "category":  "Specialty economics \u0026 practice models",
        "subcategory":  "Solo practice, group practice and small clinic",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How does group practice change scheduling and continuity?",
        "description":  null,
        "category":  "Specialty economics \u0026 practice models",
        "subcategory":  "Solo practice, group practice and small clinic",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can the clinic grow without adding another doctor?",
        "description":  null,
        "category":  "Specialty economics \u0026 practice models",
        "subcategory":  "Solo practice, group practice and small clinic",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which decisions need central control?",
        "description":  null,
        "category":  "Specialty economics \u0026 practice models",
        "subcategory":  "Solo practice, group practice and small clinic",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How do equipment use, report turnaround and referring-doctor relationships affect growth?",
        "description":  null,
        "category":  "Specialty economics \u0026 practice models",
        "subcategory":  "Diagnostic and procedure-heavy practice models",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What makes patients choose one diagnostic centre?",
        "description":  null,
        "category":  "Specialty economics \u0026 practice models",
        "subcategory":  "Diagnostic and procedure-heavy practice models",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How are quality, repeat testing and turnaround measured?",
        "description":  null,
        "category":  "Specialty economics \u0026 practice models",
        "subcategory":  "Diagnostic and procedure-heavy practice models",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How should capacity and pricing change with fluctuating demand?",
        "description":  null,
        "category":  "Specialty economics \u0026 practice models",
        "subcategory":  "Diagnostic and procedure-heavy practice models",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How should new and follow-up slots be balanced?",
        "description":  null,
        "category":  "Specialty economics \u0026 practice models",
        "subcategory":  "Consultation-led practice models",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What makes patients return for ongoing care?",
        "description":  null,
        "category":  "Specialty economics \u0026 practice models",
        "subcategory":  "Consultation-led practice models",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How can waiting fall without rushing consultations?",
        "description":  null,
        "category":  "Specialty economics \u0026 practice models",
        "subcategory":  "Consultation-led practice models",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which services should be referred out?",
        "description":  null,
        "category":  "Specialty economics \u0026 practice models",
        "subcategory":  "Consultation-led practice models",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is the content meant to create local patient demand, establish the doctor\u0027s authority, or attract other doctors as a business audience?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Content-to-business fit",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the call to action match the viewer\u0027s level of intent, or ask for a consultation before trust exists?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Content-to-business fit",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can the clinic identify which content topics bring relevant enquiries rather than vanity engagement?",
        "description":  null,
        "category":  "Content strategy \u0026 creator workflow",
        "subcategory":  "Content-to-business fit",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What exactly is included in the online OPD: booking, payment, video consultation, records, follow-up and support?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Online OPD offer design",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can a patient understand the steps from choosing a slot to completing the consultation?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Online OPD offer design",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the online OPD fit the doctor\u0027s actual workflow, or create another inbox to monitor?",
        "description":  null,
        "category":  "Digital presence \u0026 conversion assets",
        "subcategory":  "Online OPD offer design",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Who enters data, at what point, and what happens when staff skip the workflow?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "Implementation and adoption",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the software save time in the first week, or require months of extra work before benefits appear?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "Implementation and adoption",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is the migration cost of moving from paper, Excel or WhatsApp into an EMR?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "Implementation and adoption",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can the doctor retrieve a patient\u0027s previous visit quickly during a busy OPD?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "Implementation and adoption",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Who owns the clinic\u0027s data and can it be exported in a usable format?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "Vendor selection and lock-in",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What happens to access, records and booking if the vendor shuts down or raises prices?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "Vendor selection and lock-in",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are pricing, support response times, backups and downtime responsibilities clear in the contract?",
        "description":  null,
        "category":  "Clinic technology, EMR \u0026 automation",
        "subcategory":  "Vendor selection and lock-in",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Would these patients have found the clinic anyway through Google or referrals?",
        "description":  null,
        "category":  "Paid marketing \u0026 campaign economics",
        "subcategory":  "Campaign incrementality",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the clinic compare paid campaign periods with a reasonable baseline rather than crediting every booking to ads?",
        "description":  null,
        "category":  "Paid marketing \u0026 campaign economics",
        "subcategory":  "Campaign incrementality",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is the campaign filling genuinely unused capacity or displacing patients who would have paid full price?",
        "description":  null,
        "category":  "Paid marketing \u0026 campaign economics",
        "subcategory":  "Campaign incrementality",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Is the owner\u0027s salary treated as a cost before calling the remaining amount profit?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Owner compensation and true profit",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the clinic distinguish revenue, gross margin, contribution, operating profit and cash in the bank?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Owner compensation and true profit",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How much of the clinic\u0027s apparent profit depends on unpaid family labour or the owner\u0027s excessive working hours?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Owner compensation and true profit",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What is the effective earning per hour after accounting for documentation, calls, waiting gaps and administration?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Doctor time economics",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which low-value tasks are occupying time that could be used for higher-contribution clinical work?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Doctor time economics",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Would hiring reduce the owner\u0027s workload enough to justify the full employment cost?",
        "description":  null,
        "category":  "Clinic finance \u0026 unit economics",
        "subcategory":  "Doctor time economics",
        "evidence":  "Research priority: High",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "What can be observed about competitor response speed, booking friction, opening hours and digital access?",
        "description":  null,
        "category":  "Market demand \u0026 local competition",
        "subcategory":  "Competitor patient experience",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are patients choosing competitors because they are better known, easier to contact or easier to book?",
        "description":  null,
        "category":  "Market demand \u0026 local competition",
        "subcategory":  "Competitor patient experience",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which competitor advantages could a small clinic realistically match, and which would require a different strategy?",
        "description":  null,
        "category":  "Market demand \u0026 local competition",
        "subcategory":  "Competitor patient experience",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Do patients know the expected fee, waiting time, location and visit process before arriving?",
        "description":  "Focus on access, clarity, service and expectations; not diagnosis, treatment advice or clinical judgement.",
        "category":  "Patient experience \u0026 communication",
        "subcategory":  "Expectation setting",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are the promises made by reception, website and social media consistent with what the clinic delivers?",
        "description":  "Focus on access, clarity, service and expectations; not diagnosis, treatment advice or clinical judgement.",
        "category":  "Patient experience \u0026 communication",
        "subcategory":  "Expectation setting",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which recurring misunderstandings could be prevented with a clearer message or a simple pre-visit instruction?",
        "description":  "Focus on access, clarity, service and expectations; not diagnosis, treatment advice or clinical judgement.",
        "category":  "Patient experience \u0026 communication",
        "subcategory":  "Expectation setting",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Can the clinic record how a new patient heard about it without asking intrusive questions?",
        "description":  "Focus on source attribution and relationship systems, not clinical referral decisions or professional association rules.",
        "category":  "Word of mouth, referrals \u0026 reputation",
        "subcategory":  "Source tracking, not clinical referral advice",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which sources generate patients who actually attend, and which generate low-intent enquiries?",
        "description":  "Focus on source attribution and relationship systems, not clinical referral decisions or professional association rules.",
        "category":  "Word of mouth, referrals \u0026 reputation",
        "subcategory":  "Source tracking, not clinical referral advice",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the clinic thank people for appropriate recommendations without offering improper incentives?",
        "description":  "Focus on source attribution and relationship systems, not clinical referral decisions or professional association rules.",
        "category":  "Word of mouth, referrals \u0026 reputation",
        "subcategory":  "Source tracking, not clinical referral advice",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Does the content invite viewers to treat a public comment or DM as a personal consultation?",
        "description":  "Operational/communication framing only; verify current rules with authoritative professional guidance.",
        "category":  "Digital compliance, privacy \u0026 operational risk",
        "subcategory":  "Social media boundaries",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are patient questions moved to an appropriate private and documented channel when needed?",
        "description":  "Operational/communication framing only; verify current rules with authoritative professional guidance.",
        "category":  "Digital compliance, privacy \u0026 operational risk",
        "subcategory":  "Social media boundaries",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Are staff clear about what they can answer administratively and what must be escalated to the doctor?",
        "description":  "Operational/communication framing only; verify current rules with authoritative professional guidance.",
        "category":  "Digital compliance, privacy \u0026 operational risk",
        "subcategory":  "Social media boundaries",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which services are consultation-led, procedure-led, diagnostic-led or follow-up-heavy in this specialty?",
        "description":  null,
        "category":  "Specialty economics \u0026 practice models",
        "subcategory":  "Service-line economics",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "How do average visit duration, repeat frequency and equipment needs change the economics?",
        "description":  null,
        "category":  "Specialty economics \u0026 practice models",
        "subcategory":  "Service-line economics",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    },
    {
        "title":  "Which metrics should be compared only within the same specialty or service type?",
        "description":  null,
        "category":  "Specialty economics \u0026 practice models",
        "subcategory":  "Service-line economics",
        "evidence":  "Research priority: Core",
        "isDefault":  true,
        "isUserCreated":  false
    }
];
