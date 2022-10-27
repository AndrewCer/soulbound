import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';
import { SummarizationModel } from '../../models/ai.model';

const googleAiUrl = 'https://aiworkshop.googleapis.com/v1experimental/projects/ai-workshop-tif/locations/us-central1/models/TIF3298984826652076257:predict'
const projectId = 'syfted';


class AIService {

    public async summarizeNews(text: string) {
        const auth = new GoogleAuth({
            scopes: 'https://www.googleapis.com/auth/cloud-platform',
        });
        const token = await auth.getAccessToken();

        const requestData = {
            "summarization_request": {
                "document_text": text,
                "model_id": SummarizationModel.aritcleBullet
            }
        }

        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                "Content-Type": "application/json",
                "X-Goog-User-Project": projectId
            }
        }
        try {
            const response = await axios.post(googleAiUrl, requestData, config);

            return {
                success: {
                    text: response.data.summarizationResponse.summaryText.replaceAll(' .\n', '.\n-').replaceAll(' .', '.')
                }
            };
        } catch (error: any) {
            console.log('error: ', error);

            return {
                errorCode: 'Errors while fetching summary'
            }
        }
    }
}

export = new AIService();
