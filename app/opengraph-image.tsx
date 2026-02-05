import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Regístrame Ya! - Tu Contacto Profesional en 1 Clic'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div
                    style={{
                        width: '320px',
                        height: '580px',
                        background: '#FDFBF7', // Cream background
                        borderRadius: '40px',
                        border: '8px solid #1a1a1a',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Notch */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '150px',
                            height: '25px',
                            background: '#1a1a1a',
                            borderBottomLeftRadius: '16px',
                            borderBottomRightRadius: '16px',
                            zIndex: 10,
                        }}
                    />

                    <div
                        style={{
                            padding: '60px 20px 20px',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '28px',
                                fontWeight: 800,
                                color: '#0F172A', // Navy
                                marginBottom: '5px',
                                fontFamily: 'sans-serif',
                            }}
                        >
                            Regístrame Ya!
                        </div>
                        <div
                            style={{
                                fontSize: '14px',
                                color: '#64748B',
                                fontFamily: 'sans-serif',
                            }}
                        >
                            Tu contacto profesional
                        </div>
                    </div>

                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '20px',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '36px',
                                fontWeight: 900,
                                lineHeight: 1.2,
                                color: '#0F172A',
                                marginBottom: '30px',
                                textAlign: 'center',
                                fontFamily: 'sans-serif',
                            }}
                        >
                            Conecta<br />sin límites
                        </div>

                        <div
                            style={{
                                background: '#0F172A',
                                color: 'white',
                                padding: '15px 35px',
                                borderRadius: '12px',
                                fontSize: '18px',
                                fontWeight: 600,
                                fontFamily: 'sans-serif',
                            }}
                        >
                            Comenzar
                        </div>
                    </div>

                    {/* Decorative Orb */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '-40px',
                            right: '-40px',
                            width: '180px',
                            height: '180px',
                            background: 'linear-gradient(45deg, #FFD700, #FF8C00)',
                            borderRadius: '50%',
                            filter: 'blur(40px)',
                            opacity: 0.2,
                        }}
                    />
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
