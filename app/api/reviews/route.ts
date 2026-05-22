import { NextResponse } from 'next/server';

export async function GET() {
  const PLACE_ID = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID;
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

  if (!PLACE_ID || !API_KEY) {
    console.warn('[Reviews] API no configurada - PLACE_ID o API_KEY faltante');
    return NextResponse.json({
      rating: 0,
      user_ratings_total: 0,
      reviews: [],
    });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews,rating,user_ratings_total&key=${API_KEY}&language=es`;
    
    const response = await fetch(url, { next: { revalidate: 86400 } }); // Cache por 24 horas
    const data = await response.json();

    if (data.status !== 'OK') {
      return NextResponse.json({ error: data.error_message || data.status }, { status: 400 });
    }

    return NextResponse.json({
      rating: data.result.rating,
      user_ratings_total: data.result.user_ratings_total,
      reviews: data.result.reviews || [],
    });
  } catch (error) {
    console.error('Error fetching Google Reviews:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
