import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Linkedin, Github, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#1a2634] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image src="/vltc-logo.png" alt="VLTC Logo" width={40} height={40} className="rounded-full" />
              <span className="font-bold text-lg">Văn Lang Tech Club</span>
            </div>
            <p className="text-white/70 text-sm">
              Câu lạc bộ công nghệ thông tin của Đại học Văn Lang, nơi kết nối đam mê và sáng tạo.
            </p>
            <div className="flex space-x-3">
              <Link href="https://www.facebook.com/vlutech" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <Facebook className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <Instagram className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <Linkedin className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <Github className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">Liên kết nhanh</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/about" className="text-white/70 hover:text-white transition-colors">
                Giới thiệu
              </Link>
              <Link href="/events" className="text-white/70 hover:text-white transition-colors">
                Sự kiện
              </Link>
              <Link href="/projects" className="text-white/70 hover:text-white transition-colors">
                Dự án
              </Link>
              <Link href="/library" className="text-white/70 hover:text-white transition-colors">
                Thư viện
              </Link>
              <Link href="/join" className="text-white/70 hover:text-white transition-colors">
                Tham gia CLB
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">Liên hệ</h3>
            <div className="space-y-3 text-white/70">
              <div className="flex items-start">
                <Mail className="mr-2 h-5 w-5 flex-shrink-0 text-white" />
                <span>k.cntt-itclub@vanlanguni.vn</span>
              </div>
              <div className="flex items-start">
                <Phone className="mr-2 h-5 w-5 flex-shrink-0 text-white" />
                <span>028.7109 9221</span>
              </div>
              <div className="flex items-start">
                <MapPin className="mr-2 h-5 w-5 flex-shrink-0 text-white" />
                <span>69/68 Đặng Thùy Trâm, Phường 13, Quận Bình Thạnh</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">Đăng ký nhận tin</h3>
            <p className="text-white/70 text-sm">
              Đăng ký để nhận thông tin mới nhất về các sự kiện và hoạt động của CLB.
            </p>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="Email của bạn"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button className="bg-blue-600 hover:bg-blue-700">Đăng ký</Button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/50 text-sm">© {currentYear} Văn Lang Tech Club. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-white/50 text-sm hover:text-white transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/terms" className="text-white/50 text-sm hover:text-white transition-colors">
              Điều khoản sử dụng
            </Link>
            <Link href="/contact" className="text-white/50 text-sm hover:text-white transition-colors">
              Liên hệ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
