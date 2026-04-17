const Footer = () => (
  <footer className="bg-secondary mt-16 border-t">
    <div className="container py-8 text-sm text-muted-foreground flex flex-col sm:flex-row justify-between gap-4">
      <p>© {new Date().getFullYear()} RedRoute.</p>
    </div>
  </footer>
);
export default Footer;
