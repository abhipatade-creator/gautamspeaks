/* Shared product catalogue. Edit prices and copy here — shop.html, the
   detail pages and the cart all read from this one list. */
const PRODUCTS = [
 {id:'shree-yantra', img:'yantra-shree', cat:'yantra', price:1100, name:'Shree Yantra',
  tag:'Copper, energised',
  about:'The Shree Yantra is the geometry of abundance — nine interlocking triangles around a central bindu, ringed by lotus petals and enclosed in the bhupura. Traditionally kept in the puja room or a north-east corner, facing east.',
  specs:[['Material','99.9% pure copper'],['Size','3 × 3 inches'],['Finish','Hand-etched, antique'],['Energised','Yes, before dispatch'],['Placement','North-east, facing east']],
  suits:'Wealth, stability and removing obstacles to prosperity.'},

 {id:'vastu-dosh-yantra', img:'yantra-vastu', cat:'yantra', price:1450, name:'Vastu Dosh Nivaran Yantra',
  tag:'Copper, energised',
  about:'The Vastu Purusha mandala rendered as 81 padas with the deity at the centre. Used where a property cannot be structurally corrected — a rented flat, a shared office, a load-bearing wall in the wrong place.',
  specs:[['Material','99.9% pure copper'],['Size','4 × 4 inches'],['Grid','81 padas (9 × 9)'],['Energised','Yes, before dispatch'],['Placement','As advised after a Vastu reading']],
  suits:'Homes and offices with a Vastu defect that cannot be rebuilt away.'},

 {id:'kuber-yantra', img:'yantra-kuber', cat:'yantra', price:950, name:'Kuber Yantra',
  tag:'Copper, energised',
  about:'The magic square of Kubera, treasurer of the gods — every row, column and diagonal sums to 72. Kept in a cash box, safe or the north wall of a business.',
  specs:[['Material','99.9% pure copper'],['Size','3 × 3 inches'],['Square','Sums to 72 in every direction'],['Energised','Yes, before dispatch'],['Placement','North wall, or inside a cash box']],
  suits:'Business owners, and anyone with money that arrives but does not stay.'},

 {id:'rashi-bracelet', img:'brac-rashi', cat:'bracelet', price:849, name:'Rashi Bracelet',
  tag:'Your sign’s stone',
  about:'A stretch bracelet strung with the stone of your janma rashi. Tell us your moon sign when ordering, or send your birth details and we will work it out before we string it.',
  specs:[['Beads','8 mm natural stone'],['Fitting','Elastic, 7.5 inches'],['Made to','Your janma rashi'],['Energised','Yes, with the sign’s mantra'],['Wear on','Right hand for men, left for women']],
  suits:'Anyone wanting daily support from their own sign’s stone.'},

 {id:'rudraksha-7mukhi', img:'brac-rudraksha', cat:'bracelet', price:750, name:'7 Mukhi Rudraksha Bracelet',
  tag:'Nepali beads',
  about:'Seven-faced rudraksha, associated with Mahalakshmi and with relief from Shani’s pressure. Nepali beads, larger and deeper-grooved than Indonesian ones, tested before stringing.',
  specs:[['Beads','Nepali 7 Mukhi, 10–12 mm'],['Count','12 beads'],['Fitting','Elastic, 7.5 inches'],['Energised','Yes, with the Shani mantra'],['Certificate','Included']],
  suits:'Sade Sati, Shani dasha, and steady money worries.'},

 {id:'pyrite-tiger-eye', img:'brac-pyrite', cat:'bracelet', price:849, name:'Pyrite & Tiger Eye Bracelet',
  tag:'Wealth & drive',
  about:'Pyrite for money flow, tiger eye for nerve. A working combination for people who need both the opportunity and the courage to take it.',
  specs:[['Beads','8 mm pyrite and tiger eye'],['Fitting','Elastic, 7.5 inches'],['Finish','Natural, unpolished pyrite'],['Energised','Yes, before dispatch'],['Care','Keep away from water']],
  suits:'Sales, business, and anyone stuck at the point of asking.'},

 {id:'vastu-pyramid-set', img:'vastu-pyramid', cat:'vastu', price:1600, name:'Vastu Pyramid Set',
  tag:'Set of 9',
  about:'Nine pyramids to place at the defective corners of a property. The usual remedy where a north-east is cut, a south-west is light, or a toilet sits in the wrong quadrant.',
  specs:[['Pieces','9 pyramids'],['Material','Brass, gold finish'],['Size','1 inch each'],['Energised','Yes, before dispatch'],['Placement','As advised after a Vastu reading']],
  suits:'Flats with corner defects that cannot be structurally fixed.'},

 {id:'copper-vastu-plate', img:'vastu-plate', cat:'vastu', price:1250, name:'Copper Vastu Plate',
  tag:'For the main door',
  about:'A copper disc marked with the eight directions and the central brahmasthan, fixed above or beside the main entrance — the point through which a building takes in energy.',
  specs:[['Material','99.9% pure copper'],['Size','4 inch diameter'],['Marking','Eight directions, brahmasthan'],['Energised','Yes, before dispatch'],['Placement','Above the main door, inside']],
  suits:'Entrances facing an inauspicious direction.'},

 {id:'career-report', img:'rep-career', cat:'report', price:2700, name:'Career Report', digital:true,
  tag:'PDF, 24–48 hrs',
  about:'A written analysis of the 10th house, its lord, the dasha sequence and the yogas that govern professional life — with the periods that favour a change and those that do not.',
  specs:[['Format','PDF, 12–16 pages'],['Delivery','24–48 hours'],['Needs','Date, time and place of birth'],['Covers','Field, timing, promotion, business vs job'],['Follow-up','One round of questions included']],
  suits:'Anyone weighing a change of job, field or country.'},

 {id:'marriage-report', img:'rep-marriage', cat:'report', price:2400, name:'Marriage & Compatibility Report', digital:true,
  tag:'PDF, 24–48 hrs',
  about:'The 7th house, Venus, Jupiter for women, and the timing of marriage — plus full Ashtakoot matching if you send both charts.',
  specs:[['Format','PDF, 12–16 pages'],['Delivery','24–48 hours'],['Needs','Birth details, both people if matching'],['Covers','Timing, compatibility, Mangal dosha'],['Follow-up','One round of questions included']],
  suits:'Families weighing a proposal, and delayed marriages.'},

 {id:'wealth-report', img:'rep-finance', cat:'report', price:2400, name:'Wealth & Finance Report', digital:true,
  tag:'PDF, 24–48 hrs',
  about:'The 2nd and 11th houses, dhana yogas, and the periods in which money is earned versus the periods in which it leaves.',
  specs:[['Format','PDF, 12–16 pages'],['Delivery','24–48 hours'],['Needs','Date, time and place of birth'],['Covers','Income, savings, debt, property'],['Follow-up','One round of questions included']],
  suits:'Money that arrives but does not accumulate.'},

 {id:'health-report', img:'rep-health', cat:'report', price:2100, name:'Health Report', digital:true,
  tag:'PDF, 24–48 hrs',
  about:'The 6th house, the ascendant lord and the periods that warrant caution. Guidance for prevention and timing — never a diagnosis.',
  specs:[['Format','PDF, 10–14 pages'],['Delivery','24–48 hours'],['Needs','Date, time and place of birth'],['Covers','Constitution, vulnerable periods, remedies'],['Note','Not a substitute for medical advice']],
  suits:'Planning around recurring or long-running complaints.'},

 {id:'business-report', img:'rep-business', cat:'report', price:3000, name:'Business Report', digital:true,
  tag:'PDF, 24–48 hrs',
  about:'Whether the chart supports business over employment, which line suits it, partnership prospects, and the muhurat window for launching.',
  specs:[['Format','PDF, 16–20 pages'],['Delivery','24–48 hours'],['Needs','Birth details, and the venture if it exists'],['Covers','Line, partners, timing, expansion'],['Follow-up','One round of questions included']],
  suits:'Starting, expanding or restructuring a venture.'},

 {id:'education-report', img:'rep-education', cat:'report', price:1800, name:'Education Report', digital:true,
  tag:'PDF, 24–48 hrs',
  about:'The 4th and 5th houses, Budh and Guru, and what the chart says about stream, higher study abroad and competitive exams.',
  specs:[['Format','PDF, 10–14 pages'],['Delivery','24–48 hours'],['Needs','Date, time and place of birth'],['Covers','Stream, exams, foreign study, timing'],['Follow-up','One round of questions included']],
  suits:'Students at a stream or exam decision.'},

 {id:'foreign-report', img:'rep-foreign', cat:'report', price:2100, name:'Foreign Settlement Report', digital:true,
  tag:'PDF, 24–48 hrs',
  about:'The 12th, 9th and 7th houses and the dasha periods that open travel — whether the chart supports settling abroad, and when.',
  specs:[['Format','PDF, 10–14 pages'],['Delivery','24–48 hours'],['Needs','Date, time and place of birth'],['Covers','Prospects, timing, favourable directions'],['Follow-up','One round of questions included']],
  suits:'Visa, PR and relocation decisions.'},

 {id:'child-report', img:'rep-child', cat:'report', price:1800, name:'Child & Family Report', digital:true,
  tag:'PDF, 24–48 hrs',
  about:'The 5th house and its lord for children and progeny, and the family dynamics the chart describes.',
  specs:[['Format','PDF, 10–14 pages'],['Delivery','24–48 hours'],['Needs','Birth details, both parents if possible'],['Covers','Progeny, timing, family harmony'],['Follow-up','One round of questions included']],
  suits:'Delayed conception and family planning questions.'}
];
if (typeof module !== 'undefined') module.exports = { PRODUCTS };
