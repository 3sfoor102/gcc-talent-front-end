import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import { fetchUserWallet, depositFundsApi } from '../services/wallet-service';

const [amount, setAmount] = useState('')
const [card, setCard] = useState('4242424242424242')

const WalletPage = () => {
    const queryClient = new QueryClient()

    const {data: walletData, isLoading, isError, error} = useQuery({
        queryKey: ['wallet'],
        queryFn: fetchUserWallet,
    })

    const {mutate:handleDeposit, isPending} = useMutation({
        mutationFn: depositFundsApi,
        onSuccess: ()=>{
            queryClient.invalidateQueries({queryKey: ['wallet']})
            setAmount('')
        }
    })
    const onSubmit = (event) => {
        event.preventDefault()
        handleDeposit({amount: Number(amount), card})
    }
    return (
        <div className="p-6 bg-[#F7F0E9] min-h-screen">
            <h2 className="text-2xl font-bold text-[#224548]">My Financial Dashboard</h2>
            <p className="text-[#2E5A5E] mt-2">
                Available: ${walletData?.data?.wallet?.available || 0}
            </p>       
            <button
                onClick={()=> handleDeposit({amount: 100, card: '4242424242424242'})}
                disabled={isPending}
                className="mt-4 bg-[#224548] text-white px-4 py-2 rounded"
            >
                {isPending ? 'Processing Escrow...':'Deposit Funds'}
            </button>
        </div>    
        )


    
}





export {
WalletPage,
}