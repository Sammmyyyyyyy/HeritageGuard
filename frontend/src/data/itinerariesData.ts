import { ItineraryPlan } from '../types/heritage';

export const ITINERARY_CIRCUITS: ItineraryPlan[] = [
  {
    id: 'circuit-golden-triangle-eco',
    title: 'Agra Heritage & Sustainable Alternative Circuit',
    region: 'North India (Uttar Pradesh & Delhi)',
    durationDays: 2,
    idealFor: 'Culture enthusiasts wanting stunning views without heavy tourist congestion',
    totalDistanceKm: 245,
    sustainabilityScore: 94,
    crowdAvoidancePercent: 68,
    stops: [
      {
        id: 'stop-1',
        monumentId: 'taj-mahal',
        monumentName: 'Taj Mahal (Sunrise Window)',
        city: 'Agra',
        timeSlot: '06:00 AM – 08:30 AM',
        recommendedDuration: '2.5 hrs',
        expectedCrowd: 'Low',
        pressureScore: 40,
        imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80',
        tips: 'Visit strictly before 8:30 AM before tourist bus arrival. Entry via East Gate is fastest.'
      },
      {
        id: 'stop-2',
        monumentId: 'mehtab-bagh',
        monumentName: 'Mehtab Bagh (Moonlight Garden)',
        city: 'Agra',
        timeSlot: '11:00 AM – 01:00 PM',
        recommendedDuration: '2 hrs',
        expectedCrowd: 'Low',
        pressureScore: 24,
        isAlternativeRecommended: true,
        alternativeSuggestion: 'Diverted during Taj peak congestion (11 AM - 3 PM) for serene riverfront photography.',
        imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80',
        travelTimeFromPrev: '20 mins by electric cab',
        tips: 'Enjoy shaded Charbagh walkways with unobstructed views of the Taj north facade across the Yamuna.'
      },
      {
        id: 'stop-3',
        monumentId: 'fatehpur-sikri',
        monumentName: 'Fatehpur Sikri Royal Complex',
        city: 'Fatehpur Sikri',
        timeSlot: '03:30 PM – 06:00 PM',
        recommendedDuration: '2.5 hrs',
        expectedCrowd: 'Moderate',
        pressureScore: 48,
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
        travelTimeFromPrev: '45 mins via NH-21',
        tips: 'Catch the sunset light illuminating the 54-metre Buland Darwaza gate.'
      }
    ]
  },
  {
    id: 'circuit-chola-temples',
    title: 'Great Living Chola Sacred Trail',
    region: 'South India (Tamil Nadu)',
    durationDays: 2,
    idealFor: 'Architecture scholars, spiritual seekers, and photographers',
    totalDistanceKm: 120,
    sustainabilityScore: 98,
    crowdAvoidancePercent: 82,
    stops: [
      {
        id: 'stop-4',
        monumentId: 'brihadisvara-temple',
        monumentName: 'Brihadisvara Temple (Thanjavur)',
        city: 'Thanjavur',
        timeSlot: '06:00 AM – 09:00 AM',
        recommendedDuration: '3 hrs',
        expectedCrowd: 'Low',
        pressureScore: 35,
        imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
        tips: 'Observe early morning abhishekam of the monolithic lingam and circumambulate the 216-ft Vimana.'
      },
      {
        id: 'stop-5',
        monumentId: 'airavatesvara-temple',
        monumentName: 'Airavatesvara Temple (Darasuram)',
        city: 'Darasuram / Kumbakonam',
        timeSlot: '11:00 AM – 02:00 PM',
        recommendedDuration: '2.5 hrs',
        expectedCrowd: 'Low',
        pressureScore: 19,
        isAlternativeRecommended: true,
        alternativeSuggestion: 'Lesser-crowded UNESCO gem with preserved musical steps and intricate miniature carvings.',
        imageUrl: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=600&q=80',
        travelTimeFromPrev: '50 mins via Kumbakonam Rd',
        tips: 'Stone wheels carved with delicate horses and water spouts shaped like yalis.'
      }
    ]
  },
  {
    id: 'circuit-karnataka-wonders',
    title: 'Vijayanagara & Chalukya Heritage Trail',
    region: 'Karnataka',
    durationDays: 3,
    idealFor: 'History explorers seeking off-the-beaten-path stone architecture',
    totalDistanceKm: 310,
    sustainabilityScore: 91,
    crowdAvoidancePercent: 74,
    stops: [
      {
        id: 'stop-6',
        monumentId: 'hampi-monuments',
        monumentName: 'Hampi Vittala Complex & Royal Enclosure',
        city: 'Hampi',
        timeSlot: '06:30 AM – 10:00 AM',
        recommendedDuration: '3.5 hrs',
        expectedCrowd: 'Moderate',
        pressureScore: 52,
        imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010f445b23e?auto=format&fit=crop&w=600&q=80',
        tips: 'Start at the Stone Chariot before tour buses arrive at 10 AM, then explore the Queens Bath.'
      },
      {
        id: 'stop-7',
        monumentId: 'badami-caves',
        monumentName: 'Badami Cave Temples & Agastya Lake',
        city: 'Badami',
        timeSlot: '03:00 PM – 06:00 PM',
        recommendedDuration: '3 hrs',
        expectedCrowd: 'Low',
        pressureScore: 26,
        isAlternativeRecommended: true,
        alternativeSuggestion: 'Alternative site to ease Hampi weekend pressure; stunning 6th-century rock-cut caves.',
        imageUrl: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=600&q=80',
        travelTimeFromPrev: '2.5 hrs scenic drive',
        tips: 'Climb Cave 4 to capture the sunset reflecting in the sacred waters of Agastya Lake.'
      }
    ]
  }
];
