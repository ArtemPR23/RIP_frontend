import {useParams} from "react-router-dom";
import {useEffect, useRef} from "react";
import {Col, Container, Row} from "reactstrap";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {fetchArtifact, removeSelectedArtifact} from "src/store/slices/artifactsSlice";
import { T_Artifact } from "src/modules/types.ts";

export const ArtifactPage = () => {
    const { id } = useParams<{id: string}>();
    const dispatch = useAppDispatch();
    const videoRef = useRef<HTMLVideoElement>(null);
    
    const selectedArtifact = useAppSelector((state) => state.samples.selectedArtifact);
    const loading = useAppSelector((state) => state.samples.loading);
    const error = useAppSelector((state) => state.samples.error);

    useEffect(() => {
        if (id) {
            dispatch(fetchArtifact(id));
        }
        return () => {
            dispatch(removeSelectedArtifact());
        };
    }, [id, dispatch]);

    useEffect(() => {
        // Автоматическое воспроизведение видео при наличии
        if (videoRef.current && selectedArtifact?.video) {
            videoRef.current.play().catch(error => {
                console.log("Автовоспроизведение не удалось:", error);
            });
        }
    }, [selectedArtifact]);

    if (loading) {
        return (
            <div className="vibes-loading">
                <div className="loading-spinner"></div>
                <p className="loading-text">Загружаем артефакт...</p>
            </div>
        );
    }

    if (error || !selectedArtifact) {
        return (
            <div className="vibes-error">
                <div className="error-icon">⚠</div>
                <h3 className="error-title">Артефакт не найден</h3>
                <p className="error-message">{error || "Произошла ошибка при загрузке"}</p>
                <button 
                    className="vibes-button primary"
                    onClick={() => window.history.back()}
                >
                    ← Вернуться назад
                </button>
            </div>
        );
    }

    // Проверяем тип артефакта для дополнительных полей
    const artifact = selectedArtifact as T_Artifact;

    return (
        <div className="vibes-portrait-mode">
            <div className="portrait-layout">
                {/* Медиа секция */}
                <div className="media-container">
                    {artifact.video ? (
                        <div className="video-wrapper">
                            <video
                                ref={videoRef}
                                src={artifact.video}
                                className="artifact-video"
                                autoPlay
                                muted
                                loop
                                playsInline
                                controls={false}
                            >
                                Ваш браузер не поддерживает видео.
                            </video>
                            <div className="video-overlay">
                                <div className="play-indicator">
                                    <span className="pulse-animation"></span>
                                    <span className="play-icon">▶</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="image-wrapper">
                            <img
                                alt={artifact.title}
                                src={artifact.image}
                                className="artifact-image"
                                onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%231a1a2e"/><text x="50%" y="50%" font-family="Arial" font-size="20" fill="%237c3aed" text-anchor="middle" dy=".3em">Изображение не найдено</text></svg>';
                                }}
                            />
                        </div>
                    )}
                    <div className="media-gradient"></div>
                </div>

                {/* Информационная секция */}
                <div className="info-container">
                    <Container className="info-content">
                        <Row>
                            <Col xs="12">
                                <div className="artifact-header">
                                    <h1 className="artifact-title">{artifact.title}</h1>
                                    <div className="influence-badge">
                                        <span className="influence-label">ИНДЕКС ВЛИЯНИЯ</span>
                                        <span className="influence-score">{artifact.base_influence_score}</span>
                                    </div>
                                </div>

                                <div className="artifact-description">
                                    <h3 className="description-title">ОПИСАНИЕ</h3>
                                    <p className="description-text">{artifact.description}</p>
                                </div>

                                {/* Дополнительные мета-данные */}
                                <div className="artifact-meta">
                                    {artifact.date && (
                                        <div className="meta-item">
                                            <span className="meta-label">ДАТА СОЗДАНИЯ</span>
                                            <span className="meta-value">{artifact.date}</span>
                                        </div>
                                    )}
                                    
                                    {artifact.author && (
                                        <div className="meta-item">
                                            <span className="meta-label">АВТОР</span>
                                            <span className="meta-value">{artifact.author}</span>
                                        </div>
                                    )}
                                    
                                    {artifact.tags && artifact.tags.length > 0 && (
                                        <div className="meta-item">
                                            <span className="meta-label">ТЕГИ</span>
                                            <div className="tags-container">
                                                {artifact.tags.map((tag, index) => (
                                                    <span key={index} className="tag">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {artifact.category && (
                                        <div className="meta-item">
                                            <span className="meta-label">КАТЕГОРИЯ</span>
                                            <span className="meta-value">{artifact.category}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Действия */}
                                <div className="artifact-actions">
                                    <button className="vibes-button primary">
                                        <span className="button-icon">❤</span>
                                        Сохранить в избранное
                                    </button>
                                    <button 
                                        className="vibes-button secondary"
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            alert('Ссылка скопирована!');
                                        }}
                                    >
                                        <span className="button-icon">↻</span>
                                        Поделиться
                                    </button>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>

            {/* Стили для портретного режима */}
            <style>{`
                .vibes-portrait-mode {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
                    color: #fff;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                    position: relative;
                }
                
                /* Стили для состояния загрузки */
                .vibes-loading {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
                }
                
                .loading-spinner {
                    width: 60px;
                    height: 60px;
                    border: 4px solid rgba(255, 255, 255, 0.1);
                    border-top-color: #7c3aed;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                }
                
                .loading-text {
                    font-size: 1.1rem;
                    color: rgba(255, 255, 255, 0.7);
                    letter-spacing: 1px;
                }
                
                /* Стили для ошибки */
                .vibes-error {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    padding: 2rem;
                    text-align: center;
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
                }
                
                .error-icon {
                    font-size: 4rem;
                    margin-bottom: 1.5rem;
                    color: #ef4444;
                }
                
                .error-title {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    background: linear-gradient(45deg, #ef4444, #dc2626);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .error-message {
                    font-size: 1.1rem;
                    color: rgba(255, 255, 255, 0.6);
                    margin-bottom: 2rem;
                    max-width: 400px;
                }
                
                /* Основная структура */
                .portrait-layout {
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                }
                
                .media-container {
                    position: relative;
                    width: 100%;
                    height: 45vh;
                    min-height: 300px;
                    overflow: hidden;
                }
                
                .video-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }
                
                .artifact-video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                    filter: brightness(0.9) contrast(1.1);
                    transform: scale(1.01);
                }
                
                .image-wrapper {
                    width: 100%;
                    height: 100%;
                }
                
                .artifact-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                    filter: brightness(0.8) contrast(1.2);
                }
                
                .video-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    pointer-events: none;
                }
                
                .play-indicator {
                    position: relative;
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .pulse-animation {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: rgba(124, 58, 237, 0.3);
                    animation: pulse 2s infinite;
                }
                
                .play-icon {
                    font-size: 24px;
                    color: #fff;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
                }
                
                .media-gradient {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 150px;
                    background: linear-gradient(to top, rgba(10, 10, 10, 0.9), transparent);
                    pointer-events: none;
                }
                
                .info-container {
                    flex: 1;
                    padding: 2rem 0;
                    background: linear-gradient(to bottom, #0a0a0a, #1a1a2e);
                }
                
                .info-content {
                    max-width: 800px;
                }
                
                /* Заголовок и бейдж */
                .artifact-header {
                    margin-bottom: 2rem;
                }
                
                .artifact-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                    background: linear-gradient(45deg, #fff, #a78bfa);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    line-height: 1.2;
                }
                
                .influence-badge {
                    display: inline-flex;
                    align-items: center;
                    background: linear-gradient(45deg, #7c3aed, #5b21b6);
                    padding: 0.5rem 1rem;
                    border-radius: 50px;
                    gap: 0.5rem;
                }
                
                .influence-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    letter-spacing: 1px;
                    opacity: 0.9;
                }
                
                .influence-score {
                    font-size: 1.25rem;
                    font-weight: 800;
                }
                
                /* Описание */
                .artifact-description {
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .description-title {
                    font-size: 0.875rem;
                    font-weight: 600;
                    letter-spacing: 2px;
                    margin-bottom: 1rem;
                    color: #a78bfa;
                    text-transform: uppercase;
                }
                
                .description-text {
                    font-size: 1.125rem;
                    line-height: 1.6;
                    opacity: 0.9;
                    margin: 0;
                }
                
                /* Мета-данные */
                .artifact-meta {
                    margin-bottom: 2rem;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                }
                
                .meta-item {
                    display: flex;
                    flex-direction: column;
                }
                
                .meta-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    letter-spacing: 1px;
                    margin-bottom: 0.5rem;
                    color: #a78bfa;
                    text-transform: uppercase;
                }
                
                .meta-value {
                    font-size: 1.125rem;
                    font-weight: 500;
                }
                
                .tags-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                
                .tag {
                    background: rgba(124, 58, 237, 0.2);
                    border: 1px solid rgba(124, 58, 237, 0.3);
                    padding: 0.375rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    transition: all 0.3s ease;
                }
                
                .tag:hover {
                    background: rgba(124, 58, 237, 0.3);
                    transform: translateY(-2px);
                }
                
                /* Кнопки действий */
                .artifact-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 2rem;
                }
                
                .vibes-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.875rem 1.5rem;
                    border: none;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 140px;
                    justify-content: center;
                    text-decoration: none;
                }
                
                .vibes-button.primary {
                    background: linear-gradient(45deg, #7c3aed, #5b21b6);
                    color: white;
                }
                
                .vibes-button.primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(124, 58, 237, 0.3);
                }
                
                .vibes-button.secondary {
                    background: transparent;
                    color: white;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                }
                
                .vibes-button.secondary:hover {
                    border-color: #7c3aed;
                    background: rgba(124, 58, 237, 0.1);
                }
                
                .button-icon {
                    font-size: 1.125rem;
                }
                
                /* Анимации */
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                @keyframes pulse {
                    0% { transform: scale(0.8); opacity: 0.7; }
                    70% { transform: scale(1.2); opacity: 0; }
                    100% { transform: scale(1.2); opacity: 0; }
                }
                
                /* Адаптивность */
                @media (max-width: 768px) {
                    .media-container {
                        height: 40vh;
                    }
                    
                    .artifact-title {
                        font-size: 2rem;
                    }
                    
                    .artifact-meta {
                        grid-template-columns: 1fr;
                    }
                    
                    .artifact-actions {
                        flex-direction: column;
                    }
                    
                    .vibes-button {
                        width: 100%;
                    }
                }
                
                @media (max-width: 480px) {
                    .media-container {
                        height: 35vh;
                    }
                    
                    .artifact-title {
                        font-size: 1.75rem;
                    }
                    
                    .description-text {
                        font-size: 1rem;
                    }
                    
                    .info-container {
                        padding: 1rem 0;
                    }
                    
                    .info-content {
                        padding: 0 1rem;
                    }
                }
            `}</style>
        </div>
    );
};