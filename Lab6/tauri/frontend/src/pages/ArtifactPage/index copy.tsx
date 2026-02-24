import * as React from 'react';
import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {CardImg, Col, Container, Row} from "reactstrap";
import mockImage from "assets/mock.png";
import {T_Artifact} from "modules/types.ts";
import {ArtifactMocks} from "modules/mocks.ts";

type Props = {
    selectedArtifact: T_Artifact | null,
    setSelectedArtifact: React.Dispatch<React.SetStateAction<T_Artifact | null>>,
    isMock: boolean,
    setIsMock: React.Dispatch<React.SetStateAction<boolean>>
}

const ArtifactPage = ({selectedArtifact, setSelectedArtifact, isMock, setIsMock}: Props) => {
    const { id } = useParams<{id: string}>();
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const env = await import.meta.env;
            const response = await fetch(`${env.VITE_API_URL}/api/artifacts/${id}`)
            const data = await response.json()
            setSelectedArtifact(data)
            
            // Если есть QR-код в ответе, сохраняем его
            if (data.qr_code) {
                setQrCodeUrl(data.qr_code);
            }
        } catch {
            createMock()
        }
    }

    const createMock = () => {
        setIsMock(true)
        const mockArtifact = ArtifactMocks.find(artifact => artifact?.id == parseInt(id as string)) as T_Artifact;
        setSelectedArtifact(mockArtifact);
        
        // Для моков также проверяем наличие QR-кода
        if (mockArtifact?.qr_code) {
            setQrCodeUrl(mockArtifact.qr_code);
        }
    }

    useEffect(() => {
        if (!isMock) {
            fetchData()
        } else {
            createMock()
        }

        return () => {
            setSelectedArtifact(null);
            setQrCodeUrl(null);
        }
    }, [id]); // Добавил id в зависимости

    if (!selectedArtifact) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
                <p className="mt-3">Загрузка артефакта...</p>
            </div>
        )
    }

    return (
        <Container className="py-4">
            <Row>
                <Col md="6">
                    <div className="mb-4">
                        <CardImg 
                            src={isMock ? mockImage as string : selectedArtifact.image} 
                            alt={selectedArtifact.title}
                            className="img-fluid rounded shadow"
                            style={{ maxHeight: '400px', objectFit: 'cover' }}
                        />
                    </div>
                    
                    {/* Блок QR-кода - только если есть данные */}
                    {qrCodeUrl && (
                        <div className="mt-4 p-4 border rounded bg-light">
                            <h4 className="mb-3">QR-код артефакта</h4>
                            <p className="text-muted small mb-3">
                                Отсканируйте QR-код, чтобы открыть эту страницу в мобильном приложении
                            </p>
                            <div className="text-center">
                                <img 
                                    src={qrCodeUrl} 
                                    alt="QR Code" 
                                    className="img-fluid"
                                    style={{ maxWidth: '200px' }}
                                />
                            </div>
                            <div className="mt-3 text-center">
                                <button 
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => {
                                        // Скачивание QR-кода
                                        const link = document.createElement('a');
                                        link.href = qrCodeUrl;
                                        link.download = `qr-${selectedArtifact.title.replace(/\s+/g, '-')}.png`;
                                        link.click();
                                    }}
                                >
                                    Скачать QR-код
                                </button>
                            </div>
                        </div>
                    )}
                </Col>
                
                <Col md="6">
                    <div className="mb-4">
                        <h1 className="mb-3">{selectedArtifact.title}</h1>
                        {selectedArtifact.author && (
                            <h5 className="text-muted mb-3">Автор: {selectedArtifact.author}</h5>
                        )}
                        {selectedArtifact.publication_year && (
                            <p className="mb-2">
                                <strong>Год публикации:</strong> {selectedArtifact.publication_year}
                            </p>
                        )}
                        {selectedArtifact.genre && (
                            <p className="mb-2">
                                <strong>Жанр:</strong> {selectedArtifact.genre}
                            </p>
                        )}
                    </div>
                    
                    <div className="mb-4">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Метрики влияния</h5>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Индекс влияния
                                        <span className="badge bg-primary rounded-pill">
                                            {selectedArtifact.base_influence_score}
                                        </span>
                                    </li>
                                    {selectedArtifact.citation_count !== undefined && (
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Цитаты
                                            <span className="badge bg-secondary rounded-pill">
                                                {selectedArtifact.citation_count}
                                            </span>
                                        </li>
                                    )}
                                    {selectedArtifact.media_mentions !== undefined && (
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Упоминания в СМИ
                                            <span className="badge bg-info rounded-pill">
                                                {selectedArtifact.media_mentions}
                                            </span>
                                        </li>
                                    )}
                                    {selectedArtifact.social_media_score !== undefined && (
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Социальные сети
                                            <span className="badge bg-success rounded-pill">
                                                {selectedArtifact.social_media_score}
                                            </span>
                                        </li>
                                    )}
                                    {selectedArtifact.adaptation_count !== undefined && (
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Адаптации
                                            <span className="badge bg-warning rounded-pill">
                                                {selectedArtifact.adaptation_count}
                                            </span>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <h5>Описание</h5>
                        <p className="fs-5 text-justify">{selectedArtifact.description}</p>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ArtifactPage;