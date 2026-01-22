import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "store/store.ts";
import {
    deleteDraftAnalysisRequest,
    fetchAnalysisRequest,
    removeAnalysisRequest,
    sendDraftAnalysisRequest,
    triggerUpdateMM,
    updateAnalysisRequest
} from "src/store/slices/analisisrequestsSlice";
import ArtifactCard from "src/components/ArtifactCard";
import {Button, Col, Form, Row} from "reactstrap";
import {E_AnalysisRequestStatus, T_Artifact} from "src/utils/types.ts";
import CustomInput from "components/CustomInput";

export const AnalysisRequestPage = () => {
    const { id } = useParams<{id: string}>();

    const dispatch = useAppDispatch()

    const navigate = useNavigate()

    const isAuthenticated = useAppSelector((state) => state.user?.is_authenticated)

    const calculationrequest = useAppSelector((state) => state.calculationrequests.calculationrequest)

    const [research_title, setName] = useState<string>(calculationrequest?.research_title)
    const [success, setSuccess] = useState<string>(calculationrequest?.success)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/403/")
        }
    }, [isAuthenticated]);

    useEffect(() => {
        dispatch(fetchAnalysisRequest(id))
        return () => dispatch(removeAnalysisRequest())
    }, []);

    useEffect(() => {
        setName(calculationrequest?.research_title)
        setSuccess(calculationrequest?.success)
    }, [calculationrequest]);

    const sendAnalysisRequest = async (e) => {
        e.preventDefault()

        await saveAnalysisRequest()

        await dispatch(sendDraftAnalysisRequest())

        navigate("/analysis_requests")
    }

    const saveAnalysisRequest = async (e?) => {
        e?.preventDefault()

        const data = {
            research_title
        }

        await dispatch(updateAnalysisRequest(data))
        await dispatch(triggerUpdateMM())
    }

    const deleteAnalysisRequest = async () => {
        await dispatch(deleteDraftAnalysisRequest())
        navigate("/artifacts")
    }

    if (!calculationrequest) {
        return (
            <div>

            </div>
        )
    }

    const isDraft = calculationrequest.status == E_AnalysisRequestStatus.Draft
    const isCompleted = calculationrequest.status == E_AnalysisRequestStatus.Completed

    return (
        <Form onSubmit={sendAnalysisRequest} className="pb-5">
            <h2 className="mb-5">{isDraft ? "Черновая заявка" : `Заявка №${id}` }</h2>
            <Row className="mb-5 fs-5 w-25">
                <CustomInput label="Название" placeholder="Введите название" value={research_title} setValue={setName} disabled={!isDraft}/>
                {isCompleted && <CustomInput label="Исход исследования" value={success ? "Успех" : "Неудача"} disabled={true}/>}
            </Row>
            <Row>
                {calculationrequest.artifacts.length > 0 ? calculationrequest.artifacts.map((sample:T_Artifact) => (
                    <Col md="4" key={sample.id} className="d-flex justify-content-center mb-5">
                        <ArtifactCard sample={sample} showRemoveBtn={isDraft} showMM={true} editMM={isDraft} value={sample.order}/>
                    </Col>
                )) :
                    <h3 className="text-center">Артефакты еще не добавлены</h3>
                }
            </Row>
            {isDraft &&
                <Row className="mt-5">
                    <Col className="d-flex gap-5 justify-content-center">
                        {/* <Button color="success" className="fs-4" onClick={saveAnalysisRequest}>Сохранить</Button> */}
                        <Button color="primary" className="fs-4" type="submit">Отправить</Button>
                        <Button color="danger" className="fs-4" onClick={deleteAnalysisRequest}>Удалить</Button>
                    </Col>
                </Row>
            }
        </Form>
    );
};