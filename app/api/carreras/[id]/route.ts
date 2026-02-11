import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log(`📡 GET /api/carreras/${id} - Obteniendo carrera del backend`);

    const response = await fetch(`${BACKEND_URL}/carreras/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error del backend para carrera ${id}:`, errorText);
      return NextResponse.json(
        { error: 'Error al obtener la carrera', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ Carrera ${id} obtenida exitosamente:`, data.nombre);

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error en GET /api/carreras/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
