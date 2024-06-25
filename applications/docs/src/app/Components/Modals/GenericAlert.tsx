import { c } from 'ttag'

import { BasicModal, ModalStateProps, PrimaryButton, useModalTwoStatic } from '@proton/components'
import { useState } from 'react'

type Props = {
  title: string
  translatedMessage: string
}

export default function GenericAlertModal({
  title,
  translatedMessage,
  onClose,
  open,
  ...modalProps
}: Props & ModalStateProps) {
  const [isOpen, setIsOpen] = useState(open)

  const handleClose = () => {
    setIsOpen(false)
    if (typeof onClose !== 'undefined') {
      onClose()
    }
  }

  return (
    <BasicModal
      title={title}
      isOpen={isOpen === undefined ? true : isOpen}
      onClose={handleClose}
      footer={
        <>
          <PrimaryButton onClick={handleClose}>{c('Action').t`Ok`}</PrimaryButton>
        </>
      }
      {...modalProps}
    >
      <p>{translatedMessage}</p>
    </BasicModal>
  )
}

export const useGenericAlertModal = () => {
  return useModalTwoStatic(GenericAlertModal)
}
