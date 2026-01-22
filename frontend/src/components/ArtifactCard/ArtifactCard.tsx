import {Button, Card, CardBody, CardText, CardTitle, Col} from "reactstrap";
import {useNavigate} from "react-router-dom";
import {Link} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {addArtifactToAnalysisRequest, fetchArtifacts} from "src/store/slices/artifactsSlice";
import {T_Artifact} from "utils/types.ts";
import {removeArtifactFromDraftAnalysisRequest, updateArtifactValue} from "src/store/slices/analisisrequestsSlice";
import CustomInput from "components/CustomInput";
import {useEffect, useState} from "react";

type Props = {
    sample: T_Artifact,
    showAddBtn?: boolean,
    showRemoveBtn?: boolean,
    showMM?: boolean,
    editMM?: boolean
}

export const ArtifactCard = ({sample, showAddBtn = false, showRemoveBtn = false, showMM=false, editMM = false}:Props) => {

    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const {save_mm} = useAppSelector(state => state.calculationrequests)

    const [local_order, setLocal_order] = useState(sample.order)

    const handeAddToDraftAnalysisRequest = async () => {
        await dispatch(addArtifactToAnalysisRequest(sample.id))
        await dispatch(fetchArtifacts())
    }

    const handleRemoveFromDraftAnalysisRequest = async () => {
        await dispatch(removeArtifactFromDraftAnalysisRequest(sample.id))
        navigate("/artifacts")

    }

    useEffect(() => {
        dispatch(updateArtifactValue({
            sample_id: sample.id,
            order: local_order
        }))
    }, [save_mm]);

    return (
        <Card key={sample.id} style={{width: '18rem' }}>
            <img
                alt=""
                src={sample.image}
                style={{"height": "200px"}}
            />
            <CardBody>
                <CardTitle tag="h5">
                    {sample.title}
                </CardTitle>
                <CardText>
                    Индекс влияния: {sample.base_influence_score}
                </CardText>
                {showMM && <CustomInput label="Параметры" type="number" value={local_order} setValue={setLocal_order} disabled={!editMM} />}
                <Col className="d-flex justify-content-between">
                    <Link to={`/artifacts/${sample.id}`}>
                        <Button color="primary" type="button">
                            Открыть
                        </Button>
                    </Link>
                    {showAddBtn &&
                        <Button color="secondary" onClick={handeAddToDraftAnalysisRequest}>
                            Добавить
                        </Button>
                    }
                    {showRemoveBtn &&
                        <Button color="danger" onClick={handleRemoveFromDraftAnalysisRequest}>
                            Удалить
                        </Button>
                    }
                </Col>
            </CardBody>
        </Card>
    );
};