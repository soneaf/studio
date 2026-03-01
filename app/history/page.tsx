import { getCocktailHistory } from '@/app/read-csv';
import RecipeHistoryViewer from '@/components/RecipeHistoryViewer';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
    const historyData = await getCocktailHistory();

    return (
        <main>
            <RecipeHistoryViewer initialData={historyData} />
        </main>
    );
}
