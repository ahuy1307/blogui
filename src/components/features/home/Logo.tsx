import Image from 'next/image'

const Logo = () => {
    return (
        <div className="cursor-pointer">
            <Image
                src="/images/logo.png"
                alt="header"
                width={120}
                height={60}
                style={{ width: 'auto', height: 'auto' }}
            />
        </div>
    )
}

export default Logo
