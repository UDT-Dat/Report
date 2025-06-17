'use client';

import { Eye, EyeOff, Lock } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
	({ className, type, ...props }, ref) => {
		const [showPassword, setShowPassword] = React.useState(false);
		const isPasswordType = type === 'password';

		let inputType;
		if (isPasswordType) {
			inputType = showPassword ? 'text' : 'password';
		} else {
			inputType = type;
		}

		const togglePasswordVisibility = () => {
			setShowPassword(!showPassword);
		};

		if (isPasswordType) {
			return (
				<div className="relative">
					<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
					<input
						type={inputType}
						className={cn(
							'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
							className
						)}
						ref={ref}
						{...props}
					/>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
						onClick={togglePasswordVisibility}
						disabled={props.disabled}
						tabIndex={-1}
					>
						{showPassword ? (
							<EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
						) : (
							<Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
						)}
						<span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
					</Button>
				</div>
			);
		}

		return (
			<input
				type={type}
				className={cn(
					'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
					className
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);
Input.displayName = 'Input';

export { Input };
