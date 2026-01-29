"use client"
import { FlowProvider } from "@/contexts/FlowContext"
import LandingPage from "@/components/LandingPage"
import EmailStep from "@/components/steps/EmailStep"
import PaymentTypeStep from "@/components/steps/PaymentTypeStep"
import UserDataStep from "@/components/steps/UserDataStep"
import TermsStep from "@/components/steps/TermsStep"
import ThirdPartyDataStep from "@/components/steps/ThirdPartyDataStep"
import WalletDataStep from "@/components/steps/WalletDataStep"
import PagomovileDataStep from "@/components/steps/PagomovileDataStep"
import SummaryStep from "@/components/steps/SummaryStep"
import PaymentStep from "@/components/steps/PaymentStep"
import RegisterStep from "@/components/steps/RegisterStep"
import LoginStep from "@/components/steps/LoginStep"
import BeneficiaryDataStep from "@/components/steps/BeneficiaryDataStep"
import SenderDataStep from "@/components/steps/SenderDataStep"
import DestinationDataStep from "@/components/steps/DestinationDataStep"
import { useFlow } from "@/contexts/FlowContext"

function FlowContent() {
  const { currentStep } = useFlow()

  switch (currentStep) {
    case "calculator":
      return <LandingPage />
    case "register":
      return <RegisterStep />
    case "login":
      return <LoginStep />
    case "email":
      return <EmailStep />
    case "payment-type":
      return <PaymentTypeStep />
    case "user-data":
      return <UserDataStep />
    case "terms":
      return <TermsStep />
    case "third-party-data":
      return <ThirdPartyDataStep />
    case "wallet-data":
      return <WalletDataStep />
    case "pagomovil-data":
      return <PagomovileDataStep />
    case "beneficiary-data":
      return <BeneficiaryDataStep />
    case "sender-data":
      return <SenderDataStep />
    case "destination-data":
      return <DestinationDataStep />
    case "summary":
      return <SummaryStep />
    case "payment":
      return <PaymentStep />
    default:
      return <LandingPage />
  }
}

export default function ZinpleAppLanding() {
  return (
    <FlowProvider>
      <FlowContent />
    </FlowProvider>
  )
}
