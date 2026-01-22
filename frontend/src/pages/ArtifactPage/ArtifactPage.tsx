import {useParams} from "react-router-dom";
import {useEffect} from "react";
import {Col, Container, Row} from "reactstrap";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {fetchArtifact, removeSelectedArtifact} from "src/store/slices/artifactsSlice";


export const ArtifactPage = () => {
    const { id } = useParams<{id: string}>();

    const dispatch = useAppDispatch()

    const selectedArtifact = useAppSelector((state) => state.samples.selectedArtifact)

    useEffect(() => {
        dispatch(fetchArtifact(id))
        return () => dispatch(removeSelectedArtifact())
    }, []);

    if (!selectedArtifact) {
        return (
            <div>
                    Нет данных
            </div>
        )
    }

    return (
        <Container>
            <Row>
                <Col md="6">
                    <img
                        alt=""
                        src={selectedArtifact.image}
                        className="w-100"
                    />
                </Col>
                <Col md="6">
                    <h1 className="mb-3">{selectedArtifact.title}</h1>
                    <p className="fs-5">Влияние: {selectedArtifact.base_influence_score}.</p>
                    <p className="fs-5">Описание: {selectedArtifact.description}</p>
                </Col>
            </Row>
        </Container>
    );
};